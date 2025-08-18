import nodemailer from 'nodemailer';
import { User } from '../entities/User';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: process.env.MAIL_ENCRYPTION === 'ssl',
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verificar conexión
    this.verifyConnection();
  }

  /**
   * Verificar conexión SMTP
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
    }
  }

  /**
   * Enviar email genérico
   */
  public async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<void> {
    try {
      const mailOptions = {
        from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Enviar email de bienvenida
   */
  public async sendWelcomeEmail(user: User): Promise<void> {
    const template = this.getWelcomeTemplate(user);
    await this.sendEmail(user.email, template.subject, template.html, template.text);
  }

  /**
   * Enviar email de restablecimiento de contraseña
   */
  public async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    const template = this.getPasswordResetTemplate(user, resetToken);
    await this.sendEmail(user.email, template.subject, template.html, template.text);
  }

  /**
   * Enviar email de verificación
   */
  public async sendVerificationEmail(user: User, verificationToken: string): Promise<void> {
    const template = this.getVerificationTemplate(user, verificationToken);
    await this.sendEmail(user.email, template.subject, template.html, template.text);
  }

  /**
   * Enviar notificación de login
   */
  public async sendLoginNotification(user: User, loginInfo: {
    ip: string;
    userAgent: string;
    location?: string;
  }): Promise<void> {
    const template = this.getLoginNotificationTemplate(user, loginInfo);
    await this.sendEmail(user.email, template.subject, template.html, template.text);
  }

  /**
   * Template de bienvenida
   */
  private getWelcomeTemplate(user: User): EmailTemplate {
    const appName = process.env.MAIL_FROM_NAME || 'Your App';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>¡Bienvenido a ${appName}!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; }
          .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a ${appName}!</h1>
          </div>
          <div class="content">
            <h2>Hola ${user.getFullName()},</h2>
            <p>¡Gracias por unirte a nuestra plataforma! Estamos emocionados de tenerte con nosotros.</p>
            <p>Tu cuenta ha sido creada exitosamente con el email: <strong>${user.email}</strong></p>
            <p>Ahora puedes empezar a explorar todas las funcionalidades que tenemos para ofrecerte.</p>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p>¡Bienvenido a bordo!</p>
            <br>
            <p>Saludos,<br>El equipo de ${appName}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      ¡Bienvenido a ${appName}!
      
      Hola ${user.getFullName()},
      
      ¡Gracias por unirte a nuestra plataforma! Tu cuenta ha sido creada exitosamente.
      
      Email de registro: ${user.email}
      
      Si tienes alguna pregunta, no dudes en contactarnos.
      
      Saludos,
      El equipo de ${appName}
    `;

    return {
      subject: `¡Bienvenido a ${appName}!`,
      html,
      text
    };
  }

  /**
   * Template de restablecimiento de contraseña
   */
  private getPasswordResetTemplate(user: User, resetToken: string): EmailTemplate {
    const appName = process.env.MAIL_FROM_NAME || 'Your App';
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Restablecer Contraseña - ${appName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; }
          .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Restablecer Contraseña</h1>
          </div>
          <div class="content">
            <h2>Hola ${user.getFullName()},</h2>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en ${appName}.</p>
            <p>Si fuiste tú quien solicitó este cambio, haz clic en el siguiente botón:</p>
            <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este enlace expirará en 1 hora por seguridad</li>
                <li>Si no solicitaste este cambio, ignora este email</li>
                <li>Tu contraseña actual seguirá siendo válida hasta que la cambies</li>
              </ul>
            </div>
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 3px;">${resetUrl}</p>
            <br>
            <p>Saludos,<br>El equipo de ${appName}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Restablecer Contraseña - ${appName}
      
      Hola ${user.getFullName()},
      
      Recibimos una solicitud para restablecer tu contraseña.
      
      Si fuiste tú quien solicitó este cambio, visita este enlace:
      ${resetUrl}
      
      IMPORTANTE:
      - Este enlace expira en 1 hora
      - Si no solicitaste este cambio, ignora este email
      
      Saludos,
      El equipo de ${appName}
    `;

    return {
      subject: `Restablecer Contraseña - ${appName}`,
      html,
      text
    };
  }

  /**
   * Template de verificación de email
   */
  private getVerificationTemplate(user: User, verificationToken: string): EmailTemplate {
    const appName = process.env.MAIL_FROM_NAME || 'Your App';
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verificar Email - ${appName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; }
          .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verificar Email</h1>
          </div>
          <div class="content">
            <h2>Hola ${user.getFullName()},</h2>
            <p>¡Gracias por registrarte en ${appName}!</p>
            <p>Para completar tu registro, necesitamos verificar tu dirección de email.</p>
            <p>Haz clic en el siguiente botón para verificar tu cuenta:</p>
            <a href="${verificationUrl}" class="button">Verificar Email</a>
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 3px;">${verificationUrl}</p>
            <br>
            <p>Saludos,<br>El equipo de ${appName}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Verificar Email - ${appName}
      
      Hola ${user.getFullName()},
      
      ¡Gracias por registrarte en ${appName}!
      
      Para completar tu registro, verifica tu email visitando:
      ${verificationUrl}
      
      Saludos,
      El equipo de ${appName}
    `;

    return {
      subject: `Verificar Email - ${appName}`,
      html,
      text
    };
  }

  /**
   * Template de notificación de login
   */
  private getLoginNotificationTemplate(user: User, loginInfo: {
    ip: string;
    userAgent: string;
    location?: string;
  }): EmailTemplate {
    const appName = process.env.MAIL_FROM_NAME || 'Your App';
    const now = new Date().toLocaleString();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nuevo Inicio de Sesión - ${appName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; }
          .info-box { background: white; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nuevo Inicio de Sesión</h1>
          </div>
          <div class="content">
            <h2>Hola ${user.getFullName()},</h2>
            <p>Te informamos que se ha iniciado sesión en tu cuenta de ${appName}.</p>
            <div class="info-box">
              <h3>Detalles del inicio de sesión:</h3>
              <p><strong>Fecha y hora:</strong> ${now}</p>
              <p><strong>Dirección IP:</strong> ${loginInfo.ip}</p>
              <p><strong>Dispositivo:</strong> ${loginInfo.userAgent}</p>
              ${loginInfo.location ? `<p><strong>Ubicación:</strong> ${loginInfo.location}</p>` : ''}
            </div>
            <p>Si fuiste tú quien inició sesión, puedes ignorar este mensaje.</p>
            <p><strong>Si no fuiste tú</strong>, te recomendamos cambiar tu contraseña inmediatamente y contactarnos.</p>
            <br>
            <p>Saludos,<br>El equipo de ${appName}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Nuevo Inicio de Sesión - ${appName}
      
      Hola ${user.getFullName()},
      
      Se ha iniciado sesión en tu cuenta.
      
      Detalles:
      - Fecha: ${now}
      - IP: ${loginInfo.ip}
      - Dispositivo: ${loginInfo.userAgent}
      ${loginInfo.location ? `- Ubicación: ${loginInfo.location}` : ''}
      
      Si no fuiste tú, cambia tu contraseña inmediatamente.
      
      Saludos,
      El equipo de ${appName}
    `;

    return {
      subject: `Nuevo Inicio de Sesión - ${appName}`,
      html,
      text
    };
  }

  /**
   * Remover HTML tags para texto plano
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}