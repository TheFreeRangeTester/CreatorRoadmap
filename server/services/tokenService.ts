import { randomBytes } from 'crypto';
import { db } from '../db';
import { passwordResetTokens } from '../../shared/schema';
import { eq, lt } from 'drizzle-orm';

export class TokenService {
  generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  async storeToken(token: string, email: string, expiryHours: number = 1): Promise<void> {
    const expiresAt = new Date(Date.now() + (expiryHours * 60 * 60 * 1000));
    
    await db.insert(passwordResetTokens).values({
      token,
      email,
      expiresAt,
    });
  }

  async validateToken(token: string): Promise<{ valid: boolean; email?: string }> {
    try {
      const result = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.token, token))
        .limit(1);

      if (result.length === 0) {
        return { valid: false };
      }

      const tokenData = result[0];
      
      if (new Date() > tokenData.expiresAt) {
        // Limpiar token expirado
        await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
        return { valid: false };
      }

      return { valid: true, email: tokenData.email };
    } catch (error) {
      console.error('Error validating token:', error);
      return { valid: false };
    }
  }

  async deleteToken(token: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  // Método para limpiar tokens expirados periódicamente
  async cleanupExpiredTokens(): Promise<void> {
    try {
      await db.delete(passwordResetTokens).where(lt(passwordResetTokens.expiresAt, new Date()));
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }
}

export const tokenService = new TokenService();

// Limpiar tokens expirados cada 30 minutos
setInterval(async () => {
  await tokenService.cleanupExpiredTokens();
}, 30 * 60 * 1000);