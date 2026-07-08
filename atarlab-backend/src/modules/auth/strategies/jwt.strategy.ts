import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type {
  JwtPayload,
  RequestUser,
} from '../../../common/interfaces/auth.interface';
import { AppConfig } from '../../../config/configuration';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const app = configService.get<AppConfig>('app')!;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: app.jwt.accessSecret,
    });
  }

  validate(payload: JwtPayload): RequestUser {
    return { id: payload.sub, roles: payload.roles };
  }
}
