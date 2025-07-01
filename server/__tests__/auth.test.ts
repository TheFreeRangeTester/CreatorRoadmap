import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express, { type Express } from 'express';
import session from 'express-session';
import { setupAuth } from '../auth';
import { MemStorage } from '../storage';

// Mock crypto module
const mockCrypto = {
  scrypt: jest.fn() as jest.MockedFunction<any>,
  randomBytes: jest.fn() as jest.MockedFunction<any>,
  timingSafeEqual: jest.fn() as jest.MockedFunction<any>,
};

jest.mock('crypto', () => mockCrypto);

describe('Auth Module', () => {
  let app: express.Application;
  let storage: MemStorage;

  beforeEach(() => {
    app = express();
    storage = new MemStorage();
    
    app.use(express.json());
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
    }));

    setupAuth(app);

    // Mock crypto functions
    mockCrypto.randomBytes.mockImplementation((size: number) => {
      return Buffer.from('a'.repeat(size));
    });

    mockCrypto.scrypt.mockImplementation(
      (password: string, salt: Buffer, keylen: number, callback: Function) => {
        // Simple mock hash for testing
        const hash = Buffer.from(password + salt.toString(), 'utf8');
        callback(null, hash);
      }
    );

    mockCrypto.timingSafeEqual.mockImplementation((a: Buffer, b: Buffer) => {
      return a.toString() === b.toString();
    });
  });

  describe('Password Hashing', () => {
    it('should hash passwords consistently', async () => {
      // This test would need to import the hashPassword function
      // For now, we'll test through the registration endpoint
      
      const userData = {
        username: 'testuser',
        password: 'testpassword',
        email: 'test@example.com',
        userRole: 'creator',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.user.username).toBe('testuser');
      
      // Verify password was hashed (should not equal original)
      const user = await storage.getUserByUsername('testuser');
      expect(user?.password).not.toBe('testpassword');
    });
  });

  describe('Registration', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        userRole: 'audience',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.user.username).toBe('newuser');
      expect(response.body.user.email).toBe('new@example.com');
      expect(response.body.user.userRole).toBe('audience');
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should reject registration with invalid data', async () => {
      const invalidUserData = {
        username: 'ab', // Too short
        password: '123', // Too short
        email: 'invalid-email',
        userRole: 'creator',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUserData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('validation');
    });

    it('should reject registration with duplicate username', async () => {
      const userData = {
        username: 'duplicate',
        password: 'password123',
        email: 'first@example.com',
        userRole: 'creator',
      };

      // First registration should succeed
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Second registration with same username should fail
      const duplicateData = {
        ...userData,
        email: 'second@example.com',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('exists');
    });

    it('should reject registration with duplicate email', async () => {
      const userData = {
        username: 'user1',
        password: 'password123',
        email: 'duplicate@example.com',
        userRole: 'creator',
      };

      // First registration should succeed
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Second registration with same email should fail
      const duplicateData = {
        ...userData,
        username: 'user2',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('exists');
    });
  });

  describe('Login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const userData = {
        username: 'loginuser',
        password: 'loginpassword',
        email: 'login@example.com',
        userRole: 'creator',
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        username: 'loginuser',
        password: 'loginpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.user.username).toBe('loginuser');
      expect(response.body.user.password).toBeUndefined();
    });

    it('should reject login with invalid username', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'loginpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid');
    });

    it('should reject login with invalid password', async () => {
      const loginData = {
        username: 'loginuser',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid');
    });

    it('should reject login with missing credentials', async () => {
      const loginData = {
        username: 'loginuser',
        // password missing
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(400);
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      // First login
      const userData = {
        username: 'logoutuser',
        password: 'password123',
        email: 'logout@example.com',
        userRole: 'audience',
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'logoutuser',
          password: 'password123',
        });

      expect(loginResponse.status).toBe(200);

      // Then logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', loginResponse.headers['set-cookie']);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.message).toContain('Logged out');
    });
  });

  describe('Session Management', () => {
    it('should maintain user session after login', async () => {
      const userData = {
        username: 'sessionuser',
        password: 'password123',
        email: 'session@example.com',
        userRole: 'creator',
      };

      // Register
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'sessionuser',
          password: 'password123',
        });

      const cookies = loginResponse.headers['set-cookie'];

      // Check that session is maintained
      const sessionResponse = await request(app)
        .get('/api/user')
        .set('Cookie', cookies);

      expect(sessionResponse.status).toBe(200);
      expect(sessionResponse.body.username).toBe('sessionuser');
    });

    it('should clear session after logout', async () => {
      const userData = {
        username: 'clearuser',
        password: 'password123',
        email: 'clear@example.com',
        userRole: 'audience',
      };

      // Register and login
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'clearuser',
          password: 'password123',
        });

      const cookies = loginResponse.headers['set-cookie'];

      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookies);

      // Check that session is cleared
      const sessionResponse = await request(app)
        .get('/api/user')
        .set('Cookie', cookies);

      expect(sessionResponse.status).toBe(401);
    });
  });

  describe('Password Comparison', () => {
    it('should correctly compare valid password', async () => {
      // This would test the comparePasswords function directly
      // For now, we test through the login flow
      const userData = {
        username: 'compareuser',
        password: 'correctpassword',
        email: 'compare@example.com',
        userRole: 'creator',
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'compareuser',
          password: 'correctpassword',
        });

      expect(response.status).toBe(200);
    });

    it('should reject invalid password comparison', async () => {
      const userData = {
        username: 'wronguser',
        password: 'rightpassword',
        email: 'wrong@example.com',
        userRole: 'audience',
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'wronguser',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });
});