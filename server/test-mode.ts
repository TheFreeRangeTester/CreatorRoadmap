import { AsyncLocalStorage } from 'node:async_hooks';
import { Request, Response, NextFunction, Express } from 'express';
import crypto from 'crypto';

export const testModeContext = new AsyncLocalStorage<{ isTestMode: boolean }>();

export function isTestMode(): boolean {
  const store = testModeContext.getStore();
  return store?.isTestMode ?? false;
}

const TEST_MODE_COOKIE = 'fanlist_test_mode';

function getTokenSecret(): string {
  return process.env.SESSION_SECRET || process.env.TEST_MODE_PASSWORD || 'fanlist-test-mode-fallback';
}

function generateTestToken(): string {
  const hmac = crypto.createHmac('sha256', getTokenSecret());
  hmac.update('test_mode_active');
  return hmac.digest('hex');
}

function verifyTestToken(token: string): boolean {
  const expected = generateTestToken();
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export function testModeMiddleware(req: Request, res: Response, next: NextFunction) {
  const testCookie = req.cookies?.[TEST_MODE_COOKIE];
  let isTest = false;
  
  if (testCookie) {
    try {
      isTest = verifyTestToken(testCookie);
    } catch {
      isTest = false;
    }
  }
  
  testModeContext.run({ isTestMode: isTest }, () => {
    next();
  });
}

export function setupTestModeRoutes(app: Express) {
  app.post('/api/test-mode/login', (req: Request, res: Response) => {
    const { password } = req.body;
    const testPassword = process.env.TEST_MODE_PASSWORD;
    
    if (!testPassword) {
      return res.status(503).json({ message: 'Test mode is not configured' });
    }
    
    if (password !== testPassword) {
      return res.status(401).json({ message: 'Invalid test mode password' });
    }
    
    const token = generateTestToken();
    res.cookie(TEST_MODE_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    res.json({ success: true, message: 'Test mode activated' });
  });
  
  app.post('/api/test-mode/logout', (req: Request, res: Response) => {
    res.clearCookie(TEST_MODE_COOKIE, { path: '/' });
    res.json({ success: true, message: 'Test mode deactivated' });
  });
  
  app.get('/api/test-mode/status', (req: Request, res: Response) => {
    res.json({ isTestMode: isTestMode() });
  });
}
