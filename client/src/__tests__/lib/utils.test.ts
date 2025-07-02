import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { cn } from '../../lib/utils';

describe('Utility Functions', () => {
  describe('cn (className merge)', () => {
    it('should merge class names correctly', () => {
      const result = cn('base-class', 'additional-class');
      expect(result).toContain('base-class');
      expect(result).toContain('additional-class');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base', isActive && 'active', !isActive && 'inactive');
      expect(result).toContain('base');
      expect(result).toContain('active');
      expect(result).not.toContain('inactive');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid');
      expect(result).toContain('base');
      expect(result).toContain('valid');
    });

    it('should merge conflicting Tailwind classes correctly', () => {
      // tailwind-merge should resolve conflicts (keeping the last one)
      const result = cn('bg-red-500', 'bg-blue-500');
      expect(result).toContain('bg-blue-500');
      expect(result).not.toContain('bg-red-500');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
      expect(result).toContain('class3');
    });
  });

  // TODO: Implement formatDate function
  /*
  describe('formatDate', () => {
    it('should format date in Spanish locale by default', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      
      // Should contain Spanish month name
      expect(result).toMatch(/enero|ene/i);
      expect(result).toContain('2024');
    });

    it('should handle different locales', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date, 'en-US');
      
      // Should contain English month name
      expect(result).toMatch(/january|jan/i);
      expect(result).toContain('2024');
    });

    it('should handle custom format options', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date, 'es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      expect(result).toContain('enero');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should handle invalid dates', () => {
      const invalidDate = new Date('invalid-date');
      const result = formatDate(invalidDate);
      
      expect(result).toBe('Fecha inválida');
    });

    it('should handle edge case dates', () => {
      const leapYearDate = new Date('2024-02-29T12:00:00Z');
      const result = formatDate(leapYearDate);
      
      expect(result).toContain('29');
      expect(result).toMatch(/febrero|feb/i);
    });
  });
  */

  // TODO: Implement truncateText function
  /*
  describe('truncateText', () => {
    it('should truncate text longer than max length', () => {
      const longText = 'This is a very long text that should be truncated';
      const result = truncateText(longText, 20);
      
      expect(result).toHaveLength(23); // 20 + '...'
      expect(result).toMatch(/...$/);
      expect(result.slice(0, -3)).toBe(longText.slice(0, 20));
    });

    it('should not truncate text shorter than max length', () => {
      const shortText = 'Short text';
      const result = truncateText(shortText, 20);
      
      expect(result).toBe(shortText);
      expect(result).not.toMatch(/...$/);
    });

    it('should handle exact length text', () => {
      const exactText = 'Exactly twenty chars';
      const result = truncateText(exactText, 20);
      
      expect(result).toBe(exactText);
      expect(result).not.toMatch(/...$/);
    });

    it('should handle empty string', () => {
      const result = truncateText('', 10);
      expect(result).toBe('');
    });

    it('should handle very short max length', () => {
      const text = 'Hello World';
      const result = truncateText(text, 3);
      
      expect(result).toBe('Hel...');
      expect(result).toHaveLength(6);
    });

    it('should handle custom suffix', () => {
      const text = 'This is a long text';
      const result = truncateText(text, 10, ' [more]');
      
      expect(result).toMatch(/ \[more\]$/);
      expect(result).toBe('This is a  [more]');
    });
  });
  */

  // TODO: Implement validateEmail function
  /*
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@domain.org',
        'user123@test-domain.com',
        'a@b.co',
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@@domain.com',
        'user@domain',
        'user name@domain.com',
        '',
        'user@domain..com',
        'user@.domain.com',
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(validateEmail('a@b.c')).toBe(true); // Minimal valid email
      expect(validateEmail('very.long.email.address@very.long.domain.name.com')).toBe(true);
      expect(validateEmail('user@localhost')).toBe(false); // No TLD
    });

    it('should be case insensitive', () => {
      expect(validateEmail('USER@EXAMPLE.COM')).toBe(true);
      expect(validateEmail('User@Example.Com')).toBe(true);
    });
  });

  describe('generateRandomToken', () => {
    it('should generate token with default length', () => {
      const token = generateRandomToken();
      expect(token).toHaveLength(32); // Default length
      expect(typeof token).toBe('string');
    });

    it('should generate token with custom length', () => {
      const token = generateRandomToken(16);
      expect(token).toHaveLength(16);
    });

    it('should generate different tokens each time', () => {
      const token1 = generateRandomToken();
      const token2 = generateRandomToken();
      expect(token1).not.toBe(token2);
    });

    it('should only contain valid characters', () => {
      const token = generateRandomToken(100);
      const validChars = /^[a-zA-Z0-9]+$/;
      expect(validChars.test(token)).toBe(true);
    });

    it('should handle very short lengths', () => {
      const token = generateRandomToken(1);
      expect(token).toHaveLength(1);
    });

    it('should handle very long lengths', () => {
      const token = generateRandomToken(1000);
      expect(token).toHaveLength(1000);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1000);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls when called again', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      debouncedFn();
      jest.advanceTimersByTime(500);
      debouncedFn(); // This should cancel the previous call

      jest.advanceTimersByTime(500); // Total: 1000ms from first call
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500); // Total: 1000ms from second call
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments correctly', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      debouncedFn('arg1', 'arg2', 123);
      jest.advanceTimersByTime(1000);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });

    it('should preserve this context', () => {
      const obj = {
        value: 'test',
        method: jest.fn(function (this: any) {
          return this.value;
        }),
      };

      const debouncedMethod = debounce(obj.method, 1000);
      debouncedMethod.call(obj);
      jest.advanceTimersByTime(1000);

      expect(obj.method).toHaveBeenCalled();
    });

    it('should handle multiple rapid calls correctly', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      // Call multiple times rapidly
      for (let i = 0; i < 10; i++) {
        debouncedFn();
        jest.advanceTimersByTime(100);
      }

      // Should not have been called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Wait for final timeout
      jest.advanceTimersByTime(1000);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should work with immediate option', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000, true);

      debouncedFn();
      expect(mockFn).toHaveBeenCalledTimes(1); // Called immediately

      debouncedFn(); // Should not call again
      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1000);
      debouncedFn(); // Should call again after timeout
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration Tests', () => {
    it('should work well with real-world scenarios', () => {
      // Test combining utilities
      const longEmail = 'very.long.email.address@example.com';
      const isValid = validateEmail(longEmail);
      const truncated = truncateText(longEmail, 20);
      const className = cn('email-input', isValid && 'valid', 'truncated');

      expect(isValid).toBe(true);
      expect(truncated).toEndWith('...');
      expect(className).toContain('valid');
    });

    it('should handle null and undefined gracefully', () => {
      expect(() => {
        cn(null as any, undefined as any, 'valid');
        truncateText(null as any, 10);
        validateEmail(null as any);
      }).not.toThrow();
    });

    it('should be performant with large inputs', () => {
      const largeText = 'A'.repeat(10000);
      const start = performance.now();

      truncateText(largeText, 100);
      validateEmail('test@example.com');
      cn('class1', 'class2', 'class3', 'class4', 'class5');

      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });
  });
  */
});