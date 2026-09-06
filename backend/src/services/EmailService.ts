// backend/src/services/EmailService.ts

const nodemailer = require("nodemailer");
import { User } from "../entities/User";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export class EmailService {
  private transporter: any;
  private from: string;

  constructor() {
    const user = process.env.EMAIL_USER || "";
    const pass = process.env.EMAIL_PASS || "";
    const host = process.env.EMAIL_HOST || "smtp.yandex.ru";
    const port = parseInt(process.env.EMAIL_PORT || "587");
    const secure = process.env.EMAIL_SECURE === "true";
    const from = process.env.EMAIL_FROM || user;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    this.from = from;

    this.transporter.verify((error: any) => {
      if (error) {
        console.error("❌ Email verification failed:", error.message);
      }
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error: any) {
      console.error("❌ Email connection failed:", error.message);
      return false;
    }
  }

  async sendTestEmail(to: string): Promise<boolean> {
    try {
      await this.sendMail({
        to,
        subject: "🔧 Тестовое письмо",
        html: `
          <h1>✅ Email работает!</h1>
          <p>Если вы видите это письмо, значит SMTP настроен правильно.</p>
          <p><strong>От:</strong> ${this.from}</p>
          <p><strong>Кому:</strong> ${to}</p>
          <p><strong>Время:</strong> ${new Date().toLocaleString()}</p>
        `,
      });
      return true;
    } catch (error: any) {
      console.error("❌ Test email failed:", error.message);
      return false;
    }
  }

  async sendWelcomeEmail(
    user: User,
    token: string,
    baseUrl: string,
    password?: string,
  ): Promise<void> {
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
          .footer { margin-top: 20px; text-align: center; color: #999; font-size: 12px; }
          .password-box { background: #fff; padding: 10px; border-radius: 4px; border: 1px solid #ddd; font-family: monospace; font-size: 14px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Добро пожаловать!</h1>
          </div>
          <div class="content">
            <p>Здравствуйте, <strong>${user.firstName || user.email}</strong>!</p>
            <p>Вам создан аккаунт в системе Mortgage Calculator.</p>
            
            <h3>📋 Данные для входа</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            ${password ? `<p><strong>Пароль:</strong> <span class="password-box">${password}</span></p>` : ""}
            
            <p>Для активации аккаунта, пожалуйста, подтвердите ваш email:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" class="button">Подтвердить email</a>
            </p>
            <p>Или скопируйте ссылку в браузер:</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 4px; border: 1px solid #ddd; font-size: 12px;">
              ${verifyUrl}
            </p>
            <p>Ссылка действительна в течение 24 часов.</p>
            <p><strong>Рекомендуем сменить пароль после первого входа.</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Mortgage Calculator. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail({
      to: user.email,
      subject: "Добро пожаловать! Подтвердите email",
      html,
    });
  }

  async sendEmailVerification(
    user: User,
    token: string,
    baseUrl: string,
  ): Promise<void> {
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
          .footer { margin-top: 20px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Подтверждение email</h1>
          </div>
          <div class="content">
            <p>Здравствуйте, <strong>${user.firstName || user.email}</strong>!</p>
            <p>Для завершения регистрации, пожалуйста, подтвердите ваш email:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" class="button">Подтвердить email</a>
            </p>
            <p>Ссылка действительна в течение 24 часов.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Mortgage Calculator. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail({
      to: user.email,
      subject: "Подтверждение email",
      html,
    });
  }

  async sendPasswordReset(
    user: User,
    token: string,
    baseUrl: string,
  ): Promise<void> {
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
          .footer { margin-top: 20px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Сброс пароля</h1>
          </div>
          <div class="content">
            <p>Здравствуйте, <strong>${user.firstName || user.email}</strong>!</p>
            <p>Вы запросили сброс пароля для вашей учетной записи.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">Сбросить пароль</a>
            </p>
            <p>Ссылка действительна в течение 1 часа.</p>
            <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Mortgage Calculator. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail({
      to: user.email,
      subject: "Сброс пароля",
      html,
    });
  }

  async sendPasswordChangedEmail(user: User, baseUrl: string): Promise<void> {
    const loginUrl = `${baseUrl}/login`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
          .footer { margin-top: 20px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Пароль изменен</h1>
          </div>
          <div class="content">
            <p>Здравствуйте, <strong>${user.firstName || user.email}</strong>!</p>
            <p>Ваш пароль был изменен администратором системы.</p>
            <p>Если вы не запрашивали изменение пароля, пожалуйста, свяжитесь с поддержкой.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" class="button">Войти в систему</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Mortgage Calculator. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail({
      to: user.email,
      subject: "Ваш пароль был изменен",
      html,
    });
  }

  private async sendMail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      const result = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
      });
      console.log(`✅ Email sent to ${to}`);
    } catch (error: any) {
      console.error(`❌ Failed to send email to ${to}:`, error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
