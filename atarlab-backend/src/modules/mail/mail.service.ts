import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AppConfig } from '../../config/configuration';

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private fromAddress: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const app = this.configService.get<AppConfig>('app')!;
    this.fromAddress = app.mail.from;
    if (app.mail.host) {
      this.transporter = nodemailer.createTransport({
        host: app.mail.host,
        port: app.mail.port,
        auth: app.mail.user
          ? { user: app.mail.user, pass: app.mail.password }
          : undefined,
      });
    } else {
      this.logger.warn(
        'MAIL_HOST not configured — emails will be logged to console instead of sent.',
      );
    }
  }

  async send(params: SendMailParams): Promise<void> {
    if (!this.transporter) {
      this.logger.log(
        `[DEV MAIL] To: ${params.to} | Subject: ${params.subject}\n${params.html}`,
      );
      return;
    }
    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
    } catch (error) {
      // Email is a best-effort side effect — a provider outage must never fail the calling
      // business operation (registration, checkout, password reset, etc).
      this.logger.error(
        `Failed to send email to ${params.to}: ${(error as Error).message}`,
      );
    }
  }

  sendOtp(to: string, code: string, purpose: string): Promise<void> {
    return this.send({
      to,
      subject: 'Your AtarLab verification code',
      html: `<p>Your OTP for ${purpose.toLowerCase().replace('_', ' ')} is <b>${code}</b>. It expires in 5 minutes.</p>`,
    });
  }

  sendVerificationEmail(to: string, link: string): Promise<void> {
    return this.send({
      to,
      subject: 'Verify your AtarLab email',
      html: `<p>Welcome to AtarLab. Please verify your email by clicking <a href="${link}">this link</a>.</p>`,
    });
  }

  sendPasswordResetEmail(to: string, link: string): Promise<void> {
    return this.send({
      to,
      subject: 'Reset your AtarLab password',
      html: `<p>Click <a href="${link}">here</a> to reset your password. This link expires in 30 minutes. If you didn't request this, ignore this email.</p>`,
    });
  }
}
