import { Resend } from 'resend';

export class EmailService {
  private resend: Resend | null = null;

  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  async sendPasswordResetEmail(email: string, token: string, lang: string = 'en'): Promise<void> {
    if (!this.resend) {
      console.error('Resend API key not configured. Email not sent.');
      throw new Error('Email service not configured');
    }
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const resetUrl = `${baseUrl}/reset-password/${token}?lang=${lang}`;

    const subjects = {
      en: 'Password Reset Request',
      es: 'Solicitud de Recuperación de Contraseña'
    };

    const messages = {
      en: {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password. Click the link below to set a new password:</p>
            <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
        text: `You have requested to reset your password. Visit this link to set a new password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`
      },
      es: {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Solicitud de Recuperación de Contraseña</h2>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace a continuación para establecer una nueva contraseña:</p>
            <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a></p>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste esto, ignora este email.</p>
          </div>
        `,
        text: `Has solicitado restablecer tu contraseña. Visita este enlace para establecer una nueva contraseña: ${resetUrl}\n\nEste enlace expirará en 1 hora.\n\nSi no solicitaste esto, ignora este email.`
      }
    };

    const currentLang = lang === 'es' ? 'es' : 'en';
    const subject = subjects[currentLang];
    const message = messages[currentLang];

    await this.resend!.emails.send({
      from: 'Ideas Leaderboard <noreply@fanlist.app>',
      to: email,
      subject: subject,
      html: message.html,
    });
  }
}

export const emailService = new EmailService();