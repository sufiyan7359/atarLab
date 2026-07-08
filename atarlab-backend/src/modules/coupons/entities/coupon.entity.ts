import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CouponType } from '../../../common/enums';

@Entity('coupons')
export class Coupon extends BaseEntity {
  @Column({ type: 'varchar', length: 30, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 10 })
  type: CouponType;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  value: number;

  @Column({
    name: 'min_order_value',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  minOrderValue: number;

  @Column({
    name: 'max_discount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  maxDiscount: number | null;

  @Column({ name: 'usage_limit', type: 'int', nullable: true })
  usageLimit: number | null;

  @Column({ name: 'used_count', type: 'int', default: 0 })
  usedCount: number;

  @Column({ name: 'per_user_limit', type: 'int', default: 1 })
  perUserLimit: number;

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
