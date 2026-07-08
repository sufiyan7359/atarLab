import { Check, Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CartItem } from './cart-item.entity';

@Entity('carts')
@Check(`"user_id" IS NOT NULL OR "session_id" IS NOT NULL`)
export class Cart extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ name: 'session_id', type: 'varchar', length: 100, nullable: true })
  sessionId: string | null;

  @Column({ name: 'coupon_code', type: 'varchar', length: 30, nullable: true })
  couponCode: string | null;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];
}
