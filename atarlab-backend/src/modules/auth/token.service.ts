import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { DataSource, IsNull, LessThan, Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';
import { AppConfig } from '../../config/configuration';
import { JwtPayload } from '../../common/interfaces/auth.interface';

export interface TokenPair {
  accessToken: string;
  refreshCookieValue: string;
  refreshExpiresAt: Date;
}

// How long a just-rotated token is still honoured for. Covers the case where a client
// fires two near-simultaneous refresh calls (double-reload, duplicate tab, a slow first
// response racing a retry) — the loser would otherwise be treated as a stolen token and
// have its whole session family revoked. Reuse *outside* this window is still treated as
// theft, since a legitimate client always moves on to the newest token immediately.
const REUSE_GRACE_MS = 15_000;

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  signAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      roles: user.roles?.map((r) => r.name) ?? [],
    };
    const app = this.configService.get<AppConfig>('app')!;
    return this.jwtService.sign(payload, {
      secret: app.jwt.accessSecret,
      expiresIn: app.jwt.accessExpiresIn,
    });
  }

  /** Issues a brand-new session family — call this on login/register/OAuth, never on rotation. */
  async issueTokenPair(
    user: User,
    meta: { userAgent?: string; ip?: string },
  ): Promise<TokenPair> {
    const accessToken = this.signAccessToken(user);
    const { cookieValue, expiresAt } = await this.createRefreshToken(
      this.refreshTokenRepo,
      user.id,
      randomUUID(),
      meta,
    );
    return {
      accessToken,
      refreshCookieValue: cookieValue,
      refreshExpiresAt: expiresAt,
    };
  }

  private async createRefreshToken(
    repo: Repository<RefreshToken>,
    userId: string,
    familyId: string,
    meta: { userAgent?: string; ip?: string },
  ): Promise<{ cookieValue: string; expiresAt: Date; id: string }> {
    const app = this.configService.get<AppConfig>('app')!;
    const secret = randomBytes(32).toString('hex');
    const tokenHash = await argon2.hash(secret);
    const expiresAt = new Date(
      Date.now() + this.parseExpiryMs(app.jwt.refreshExpiresIn),
    );

    const row = repo.create({
      userId,
      familyId,
      tokenHash,
      userAgent: meta.userAgent ?? null,
      ip: meta.ip ?? null,
      expiresAt,
    });
    const saved = await repo.save(row);
    return { cookieValue: `${saved.id}.${secret}`, expiresAt, id: saved.id };
  }

  /** Validates the cookie, rotates it, and returns a fresh pair. Throws on expiry or genuine reuse. */
  async rotateRefreshToken(
    cookieValue: string | undefined,
    meta: { userAgent?: string; ip?: string },
  ): Promise<{ tokens: TokenPair; user: User }> {
    const [id, secret] = (cookieValue ?? '').split('.');
    if (!id || !secret)
      throw new UnauthorizedException('Invalid refresh token');

    const row = await this.refreshTokenRepo.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!row) throw new UnauthorizedException('Invalid refresh token');

    if (row.revokedAt) {
      return this.handleReuse(row, meta);
    }

    if (row.expiresAt < new Date())
      throw new UnauthorizedException('Refresh token expired');

    const valid = await argon2.verify(row.tokenHash, secret);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.rotate(row, meta);
    return { tokens, user: row.user };
  }

  /** A previously-rotated token was presented again. Within the grace window this is treated
   *  as a benign race and resolved to whatever the family's current token is; outside it,
   *  it's treated as theft and only that family (not the user's other sessions) is revoked. */
  private async handleReuse(
    row: RefreshToken,
    meta: { userAgent?: string; ip?: string },
  ): Promise<{ tokens: TokenPair; user: User }> {
    const msSinceRevoked = Date.now() - (row.revokedAt?.getTime() ?? 0);

    if (msSinceRevoked <= REUSE_GRACE_MS && row.replacedByTokenId) {
      const current = await this.findCurrentInFamily(row.familyId);
      if (current) {
        const tokens = await this.rotate(current, meta);
        return { tokens, user: current.user };
      }
    }

    await this.refreshTokenRepo.update(
      { familyId: row.familyId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
    throw new UnauthorizedException(
      'Refresh token reuse detected, session revoked',
    );
  }

  /** Walks replacedByTokenId forward to the family's current (non-revoked) token, if any. */
  private async findCurrentInFamily(
    familyId: string,
  ): Promise<RefreshToken | null> {
    return this.refreshTokenRepo.findOne({
      where: { familyId, revokedAt: IsNull() },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  private async rotate(
    row: RefreshToken,
    meta: { userAgent?: string; ip?: string },
  ): Promise<TokenPair> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(RefreshToken);
      const accessToken = this.signAccessToken(row.user);
      const { cookieValue, expiresAt, id } = await this.createRefreshToken(
        repo,
        row.userId,
        row.familyId,
        meta,
      );
      await repo.update(row.id, {
        revokedAt: new Date(),
        replacedByTokenId: id,
      });
      return {
        accessToken,
        refreshCookieValue: cookieValue,
        refreshExpiresAt: expiresAt,
      };
    });
  }

  async revoke(cookieValue: string | undefined): Promise<void> {
    const [id] = (cookieValue ?? '').split('.');
    if (!id) return;
    const row = await this.refreshTokenRepo.findOne({ where: { id } });
    if (!row) return;
    await this.refreshTokenRepo.update(
      { familyId: row.familyId },
      { revokedAt: new Date() },
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokenRepo.update({ userId }, { revokedAt: new Date() });
  }

  async purgeExpired(): Promise<void> {
    await this.refreshTokenRepo.delete({ expiresAt: LessThan(new Date()) });
  }

  getRefreshCookieMaxAgeMs(): number {
    const app = this.configService.get<AppConfig>('app')!;
    return this.parseExpiryMs(app.jwt.refreshExpiresIn);
  }

  private parseExpiryMs(expiry: string): number {
    const match = /^(\d+)([smhd])$/.exec(expiry);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const unitMs =
      { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 86_400_000;
    return value * unitMs;
  }
}
