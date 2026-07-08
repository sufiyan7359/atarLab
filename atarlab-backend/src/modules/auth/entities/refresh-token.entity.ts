import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'token_hash', type: 'varchar', length: 255 })
  tokenHash: string;

  /**
   * Shared by every token descended from the same login (each rotation carries it forward).
   * Reuse-detection revokes only this family, not every session the user has elsewhere.
   */
  @Index()
  @Column({ name: 'family_id', type: 'uuid' })
  familyId: string;

  /** Set when this token is rotated — lets a reused-but-recent token be resolved to the
   *  current one (see TokenService's grace-period handling) instead of always being treated
   *  as theft, which otherwise makes rapid double-reloads log the user out. */
  @Column({ name: 'replaced_by_token_id', type: 'uuid', nullable: true })
  replacedByTokenId: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 255, nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
