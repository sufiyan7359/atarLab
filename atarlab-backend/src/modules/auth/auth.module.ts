import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Otp } from './entities/otp.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenService } from './token.service';
import { OtpService } from './otp.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { UsersModule } from '../users/users.module';
import { AppConfig } from '../../config/configuration';

const googleStrategyProvider: Provider = {
  provide: GoogleStrategy,
  useFactory: (configService: ConfigService) => {
    const app = configService.get<AppConfig>('app')!;
    if (!app.google.clientId) {
      return undefined;
    }
    return new GoogleStrategy(configService);
  },
  inject: [ConfigService],
};

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, Otp]),
    PassportModule,
    JwtModule.register({}),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    OtpService,
    JwtStrategy,
    googleStrategyProvider,
  ],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
