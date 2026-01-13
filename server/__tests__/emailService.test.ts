import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { EmailService } from '../services/emailService';

// Tipos para el mock
interface ResendEmailParams {
  from: string;
  to: string;
  subject: string;
  html: string;
}

interface ResendEmailResponse {
  id: string;
}

// Mock de Resend
const mockEmailsSend = jest.fn() as jest.MockedFunction<(params: ResendEmailParams) => Promise<ResendEmailResponse>>;
const mockResendConstructor = jest.fn();

jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation((...args: unknown[]) => {
      const apiKey = args[0] as string | undefined;
      mockResendConstructor(apiKey);
      return {
        emails: {
          send: mockEmailsSend,
        },
      };
    }),
  };
});

describe('EmailService', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let originalConsoleLog: typeof console.log;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    // Guardar el estado original
    originalEnv = { ...process.env };
    originalConsoleLog = console.log;
    originalConsoleError = console.error;

    // Limpiar mocks
    jest.clearAllMocks();
    mockEmailsSend.mockClear();
    mockResendConstructor.mockClear();

    // Mock de console para evitar ruido en los tests
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restaurar el estado original
    process.env = originalEnv;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('Constructor', () => {
    it('should initialize Resend when RESEND_API_KEY is set', () => {
      process.env.RESEND_API_KEY = 'test-api-key-123';
      const service = new EmailService();

      expect(mockResendConstructor).toHaveBeenCalledWith('test-api-key-123');
      expect(mockResendConstructor).toHaveBeenCalledTimes(1);
    });

    it('should not initialize Resend when RESEND_API_KEY is not set', () => {
      delete process.env.RESEND_API_KEY;
      const service = new EmailService();

      expect(mockResendConstructor).not.toHaveBeenCalled();
    });

    it('should not initialize Resend when RESEND_API_KEY is empty', () => {
      process.env.RESEND_API_KEY = '';
      const service = new EmailService();

      expect(mockResendConstructor).not.toHaveBeenCalled();
    });
  });

  describe('sendPasswordResetEmail', () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = 'test-api-key-123';
    });

    it('should throw error when Resend is not configured', async () => {
      delete process.env.RESEND_API_KEY;
      const service = new EmailService();

      await expect(
        service.sendPasswordResetEmail('test@example.com', 'token123')
      ).rejects.toThrow('Email service not configured');
    });

    it('should send email successfully with default language (en)', async () => {
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      await service.sendPasswordResetEmail('test@example.com', 'token123');

      expect(mockEmailsSend).toHaveBeenCalledTimes(1);
      expect(mockEmailsSend).toHaveBeenCalledWith({
        from: 'Fanlist <no-reply@fanlist.live>',
        to: 'test@example.com',
        subject: 'Password Reset Request',
        html: expect.stringContaining('Password Reset Request'),
      });
    });

    it('should send email successfully with Spanish language', async () => {
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      await service.sendPasswordResetEmail('test@example.com', 'token123', 'es');

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Solicitud de Recuperación de Contraseña',
          html: expect.stringContaining('Solicitud de Recuperación de Contraseña'),
        })
      );
    });

    it('should use BASE_URL from environment when provided', async () => {
      process.env.BASE_URL = 'https://example.com';
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      await service.sendPasswordResetEmail('test@example.com', 'token123');

      const callArgs = mockEmailsSend.mock.calls[0][0] as ResendEmailParams;
      expect(callArgs.html).toContain('https://example.com/reset-password/token123');
    });

    it('should use REPLIT_DEV_DOMAIN when BASE_URL is not set', async () => {
      delete process.env.BASE_URL;
      process.env.REPLIT_DEV_DOMAIN = 'myapp.replit.dev';
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      await service.sendPasswordResetEmail('test@example.com', 'token123');

      const callArgs = mockEmailsSend.mock.calls[0][0] as ResendEmailParams;
      expect(callArgs.html).toContain('https://myapp.replit.dev/reset-password/token123');
    });

    it('should use host parameter when provided', async () => {
      delete process.env.BASE_URL;
      delete process.env.REPLIT_DEV_DOMAIN;
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      await service.sendPasswordResetEmail('test@example.com', 'token123', 'en', 'example.com');

      const callArgs = mockEmailsSend.mock.calls[0][0] as ResendEmailParams;
      expect(callArgs.html).toContain('https://example.com/reset-password/token123');
    });

    it('should use http for localhost host parameter', async () => {
      delete process.env.BASE_URL;
      delete process.env.REPLIT_DEV_DOMAIN;
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      await service.sendPasswordResetEmail('test@example.com', 'token123', 'en', 'localhost:5000');

      const callArgs = mockEmailsSend.mock.calls[0][0] as ResendEmailParams;
      expect(callArgs.html).toContain('http://localhost:5000/reset-password/token123');
    });

    it('should fallback to localhost when no URL sources are available', async () => {
      delete process.env.BASE_URL;
      delete process.env.REPLIT_DEV_DOMAIN;
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      await service.sendPasswordResetEmail('test@example.com', 'token123');

      const callArgs = mockEmailsSend.mock.calls[0][0] as ResendEmailParams;
      expect(callArgs.html).toContain('http://localhost:5000/reset-password/token123');
    });

    it('should include language parameter in reset URL', async () => {
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      await service.sendPasswordResetEmail('test@example.com', 'token123', 'es');

      const callArgs = mockEmailsSend.mock.calls[0][0] as ResendEmailParams;
      expect(callArgs.html).toContain('?lang=es');
    });

    it('should include language parameter in reset URL for English', async () => {
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      await service.sendPasswordResetEmail('test@example.com', 'token123', 'en');

      const callArgs = mockEmailsSend.mock.calls[0][0] as ResendEmailParams;
      expect(callArgs.html).toContain('?lang=en');
    });

    it('should handle Resend API errors and rethrow them', async () => {
      const apiError = {
        message: 'Invalid API key',
        statusCode: 401,
        name: 'ResendError',
      };
      mockEmailsSend.mockRejectedValue(apiError);
      const service = new EmailService();

      await expect(
        service.sendPasswordResetEmail('test@example.com', 'token123')
      ).rejects.toEqual(apiError);

      expect(console.error).toHaveBeenCalled();
    });

    it('should include token in reset URL', async () => {
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      await service.sendPasswordResetEmail('test@example.com', 'my-special-token-456');

      const callArgs = mockEmailsSend.mock.calls[0][0] as ResendEmailParams;
      expect(callArgs.html).toContain('/reset-password/my-special-token-456');
    });

    it('should use English as default when invalid language is provided', async () => {
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      await service.sendPasswordResetEmail('test@example.com', 'token123', 'fr' as any);

      const callArgs = mockEmailsSend.mock.calls[0][0] as ResendEmailParams;
      expect(callArgs.subject).toBe('Password Reset Request');
      expect(callArgs.html).toContain('Password Reset Request');
    });

    it('should include expiration message in email content', async () => {
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      await service.sendPasswordResetEmail('test@example.com', 'token123', 'en');

      const callArgs = mockEmailsSend.mock.calls[0][0] as ResendEmailParams;
      expect(callArgs.html).toContain('This link will expire in 1 hour');
    });

    it('should include expiration message in Spanish email content', async () => {
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      await service.sendPasswordResetEmail('test@example.com', 'token123', 'es');

      const callArgs = mockEmailsSend.mock.calls[0][0] as ResendEmailParams;
      expect(callArgs.html).toContain('Este enlace expirará en 1 hora');
    });

    it('should log email sending attempt', async () => {
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      await service.sendPasswordResetEmail('test@example.com', 'token123');

      expect(console.log).toHaveBeenCalledWith('=== Resend Email Attempt ===');
      expect(console.log).toHaveBeenCalledWith('Email Service Status:', 'Configured');
      expect(console.log).toHaveBeenCalledWith('Recipient:', 'test@example.com');
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = 'test-api-key-123';
    });

    it('should handle empty email string', async () => {
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      await service.sendPasswordResetEmail('', 'token123');

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '',
        })
      );
    });

    it('should handle empty token string', async () => {
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      await service.sendPasswordResetEmail('test@example.com', '');

      const callArgs = mockEmailsSend.mock.calls[0][0] as ResendEmailParams;
      expect(callArgs.html).toContain('/reset-password/');
    });

    it('should handle special characters in token', async () => {
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      const specialToken = 'token-with-special-chars-!@#$%';
      await service.sendPasswordResetEmail('test@example.com', specialToken);

      const callArgs = mockEmailsSend.mock.calls[0][0] as ResendEmailParams;
      expect(callArgs.html).toContain(specialToken);
    });

    it('should prioritize host parameter over environment variables', async () => {
      process.env.BASE_URL = 'https://env-url.com';
      process.env.REPLIT_DEV_DOMAIN = 'env-replit.replit.dev';
      mockEmailsSend.mockResolvedValue({ id: 'email-id-123' });
      const service = new EmailService();

      await service.sendPasswordResetEmail('test@example.com', 'token123', 'en', 'host-param.com');

      const callArgs = mockEmailsSend.mock.calls[0][0] as ResendEmailParams;
      expect(callArgs.html).toContain('https://host-param.com/reset-password/token123');
      expect(callArgs.html).not.toContain('env-url.com');
      expect(callArgs.html).not.toContain('env-replit');
    });
  });
});
