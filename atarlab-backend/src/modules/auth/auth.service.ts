import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { TokenService, TokenPair } from './token.service';
import { OtpService } from './otp.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { OtpPurpose } from '../../common/enums';
import { AppConfig } from '../../config/configuration';
import { User } from '../users/entities/user.entity';
import type { GoogleProfile } from './strategies/google.strategy';
import { Duration } from '../../common/types/duration.type';

interface RequestMeta {
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: User }> {
    if (dto.email && (await this.usersService.findByEmail(dto.email))) {
      throw new BadRequestException('An account with this email already exists');
    }
    if (dto.phone && (await this.usersService.findByPhone(dto.phone))) {
      throw new BadRequestException('An account with this phone already exists');
    }
    const user = await this.usersService.createLocal({
      email: dto.email,
      phone: dto.phone,
      fullName: dto.fullName,
      password: dto.password,
    });

    if (dto.email) {
      const token = this.signPurposeToken(user.id, 'verify-email', '1d');
      const link = `${this.frontendUrl}/auth/verify-email?token=${token}`;
      await this.mailService.sendVerificationEmail(dto.email, link);
    }
    return { user };
  }

  async login(dto: LoginDto, meta: RequestMeta): Promise<TokenPair & { user: User }> {
    const user = dto.identifier.includes('@')
      ? await this.usersService.findByEmail(dto.identifier)
      : await this.usersService.findByPhone(dto.identifier);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }
    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.tokenService.issueTokenPair(user, meta);
    return { ...tokens, user };
  }

  async requestOtp(identifier: string, purpose: OtpPurpose): Promise<void> {
    await this.otpService.request(identifier, purpose);
  }

  async verifyOtp(dto: OtpVerifyDto, meta: RequestMeta): Promise<TokenPair & { user: User }> {
    await this.otpService.verify(dto.identifier, dto.purpose, dto.code);

    let user = dto.identifier.includes('@')
      ? await this.usersService.findByEmail(dto.identifier)
      : await this.usersService.findByPhone(dto.identifier);

    if (!user && (dto.purpose === OtpPurpose.REGISTER || dto.purpose === OtpPurpose.LOGIN)) {
      user = dto.identifier.includes('@')
        ? await this.usersService.createFromGoogle({
            email: dto.identifier,
            fullName: dto.fullName ?? dto.identifier.split('@')[0],
            googleId: `otp:${dto.identifier}`,
          })
        : await this.usersService.createLocal({
            phone: dto.identifier,
            fullName: dto.fullName ?? 'AtarLab Customer',
            password: argonRandomPassword(),
          });
    }
    if (!user) throw new BadRequestException('No account found for this identifier');

    if (dto.purpose === OtpPurpose.VERIFY_PHONE) {
      await this.usersService.markPhoneVerified(user.id);
    }

    const tokens = await this.tokenService.issueTokenPair(user, meta);
    return { ...tokens, user };
  }

  async refresh(cookieValue: string, meta: RequestMeta): Promise<TokenPair & { user: User }> {
    const { tokens, user } = await this.tokenService.rotateRefreshToken(cookieValue, meta);
    return { ...tokens, user };
  }

  async logout(cookieValue: string): Promise<void> {
    await this.tokenService.revoke(cookieValue);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return; // no user enumeration
    const token = this.signPurposeToken(user.id, 'reset-password', '30m');
    const link = `${this.frontendUrl}/auth/reset-password?token=${token}`;
    await this.mailService.sendPasswordResetEmail(email, link);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const userId = this.verifyPurposeToken(token, 'reset-password');
    await this.usersService.setPassword(userId, newPassword);
    await this.tokenService.revokeAllForUser(userId);
  }

  async verifyEmail(token: string): Promise<void> {
    const userId = this.verifyPurposeToken(token, 'verify-email');
    await this.usersService.markEmailVerified(userId);
  }

  async validateGoogleLogin(profile: GoogleProfile, meta: RequestMeta): Promise<TokenPair & { user: User }> {
    let user = await this.usersService.findByGoogleId(profile.googleId);
    if (!user) {
      const existing = await this.usersService.findByEmail(profile.email);
      user = existing
        ? await this.usersService.linkGoogleAccount(existing, profile.googleId, profile.avatarUrl)
        : await this.usersService.createFromGoogle({
            email: profile.email,
            fullName: profile.fullName,
            googleId: profile.googleId,
            avatarUrl: profile.avatarUrl,
          });
    }
    const tokens = await this.tokenService.issueTokenPair(user, meta);
    return { ...tokens, user };
  }

  private signPurposeToken(userId: string, purpose: string, expiresIn: Duration): string {
    const app = this.configService.get<AppConfig>('app')!;
    return this.jwtService.sign(
      { sub: userId, purpose },
      { secret: app.jwt.accessSecret, expiresIn },
    );
  }

  private verifyPurposeToken(token: string, purpose: string): string {
    const app = this.configService.get<AppConfig>('app')!;
    try {
      const payload = this.jwtService.verify<{ sub: string; purpose: string }>(token, {
        secret: app.jwt.accessSecret,
      });
      if (payload.purpose !== purpose) throw new Error('purpose mismatch');
      return payload.sub;
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  private get frontendUrl(): string {
    return this.configService.get<AppConfig>('app')!.frontendUrl;
  }
}

function argonRandomPassword(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
