import { randomBytes } from 'crypto';

interface TokenData {
  email: string;
  expiry: number;
}

export class TokenService {
  private tokens: Map<string, TokenData> = new Map();

  generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  storeToken(token: string, email: string, expiryHours: number = 1): void {
    const expiry = Date.now() + (expiryHours * 60 * 60 * 1000); // 1 hora por defecto
    this.tokens.set(token, { email, expiry });
  }

  validateToken(token: string): { valid: boolean; email?: string } {
    const tokenData = this.tokens.get(token);
    
    if (!tokenData) {
      return { valid: false };
    }

    if (Date.now() > tokenData.expiry) {
      this.tokens.delete(token); // Limpiar token expirado
      return { valid: false };
    }

    return { valid: true, email: tokenData.email };
  }

  deleteToken(token: string): void {
    this.tokens.delete(token);
  }

  // Método para limpiar tokens expirados periódicamente
  cleanupExpiredTokens(): void {
    const now = Date.now();
    const tokensToDelete: string[] = [];
    
    this.tokens.forEach((data, token) => {
      if (now > data.expiry) {
        tokensToDelete.push(token);
      }
    });
    
    tokensToDelete.forEach(token => this.tokens.delete(token));
  }
}

export const tokenService = new TokenService();

// Limpiar tokens expirados cada 30 minutos
setInterval(() => {
  tokenService.cleanupExpiredTokens();
}, 30 * 60 * 1000);