import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { TokenService, TokenPair } from './token.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OtpRequestDto } from './dto/otp-request.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/interfaces/auth.interface';
import { UsersService } from '../users/users.service';
import { AppConfig } from '../../config/configuration';
import type { GoogleProfile } from './strategies/google.strategy';
import { User } from '../users/entities/user.entity';

const REFRESH_COOKIE = 'refresh_token';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const { user } = await this.authService.register(dto);
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
    };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto, this.meta(req));
    return this.respondWithTokens(res, result);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() dto: OtpRequestDto) {
    await this.authService.requestOtp(dto.identifier, dto.purpose);
    return { message: 'OTP sent' };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() dto: OtpVerifyDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyOtp(dto, this.meta(req));
    return this.respondWithTokens(res, result);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Passport redirects to Google; body never reached.
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: Request & { user: GoogleProfile },
    @Res() res: Response,
  ) {
    const result = await this.authService.validateGoogleLogin(
      req.user,
      this.meta(req),
    );
    this.setRefreshCookie(
      res,
      result.refreshCookieValue,
      result.refreshExpiresAt,
    );
    const app = this.configService.get<AppConfig>('app')!;
    res.redirect(
      `${app.frontendUrl}/auth/google/callback?token=${result.accessToken}`,
    );
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookieValue = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_COOKIE
    ];
    const result = await this.authService.refresh(cookieValue, this.meta(req));
    return this.respondWithTokens(res, result);
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookieValue = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_COOKIE
    ];
    await this.authService.logout(cookieValue);
    res.clearCookie(REFRESH_COOKIE);
    return { message: 'Logged out' };
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { message: 'If the account exists, a reset link has been sent' };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { message: 'Password reset successful' };
  }

  @Public()
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    await this.authService.verifyEmail(token);
    return { message: 'Email verified' };
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return this.usersService.findById(user.id);
  }

  private meta(req: Request): { userAgent?: string; ip?: string } {
    return { userAgent: req.headers['user-agent'], ip: req.ip };
  }

  private setRefreshCookie(
    res: Response,
    value: string,
    expiresAt: Date,
  ): void {
    const app = this.configService.get<AppConfig>('app')!;
    res.cookie(REFRESH_COOKIE, value, {
      httpOnly: true,
      // SameSite=None is only meaningful (and only accepted by browsers) with Secure —
      // true whenever it matters, since 'none' is only ever set for real (HTTPS) deploys.
      secure: app.env !== 'local' || app.cookieSameSite === 'none',
      sameSite: app.cookieSameSite,
      expires: expiresAt,
      // Path is intentionally '/', not '/api/v1/auth': when frontend and API share one
      // origin behind a reverse proxy, the Angular SSR server must receive this cookie on
      // ordinary page requests (e.g. GET /checkout) to forward it when silently refreshing
      // the session server-side. httpOnly + Secure + SameSite already provide the real
      // protection here — Path scoping added no security value.
      path: '/',
    });
  }

  private respondWithTokens(res: Response, result: TokenPair & { user: User }) {
    this.setRefreshCookie(
      res,
      result.refreshCookieValue,
      result.refreshExpiresAt,
    );
    return {
      accessToken: result.accessToken,
      user: this.sanitizeUser(result.user),
    };
  }

  private sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- discarded on purpose
    const { passwordHash: _passwordHash, ...safe } = user;
    return safe;
  }
}
