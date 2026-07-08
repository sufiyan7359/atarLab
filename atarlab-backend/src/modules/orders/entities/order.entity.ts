import { Column, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Address } from '../../addresses/entities/address.entity';
import { Coupon } from '../../coupons/entities/coupon.entity';
import { OrderStatus, PaymentStatus, PaymentMethod } from '../../../common/enums';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ name: 'order_number', type: 'varchar', length: 20, unique: true })
  orderNumber: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 30, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ name: 'payment_status', type: 'varchar', length: 20, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ name: 'payment_method', type: 'varchar', length: 20 })
  paymentMethod: PaymentMethod;

  @Column({ name: 'shipping_address_id', type: 'uuid' })
  shippingAddressId: string;

  @ManyToOne(() => Address, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'shipping_address_id' })
  shippingAddress: Address;

  @Column({ name: 'billing_address_id', type: 'uuid', nullable: true })
  billingAddressId: string | null;

  @ManyToOne(() => Address, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'billing_address_id' })
  billingAddress: Address | null;

  @Column({ name: 'coupon_id', type: 'uuid', nullable: true })
  couponId: string | null;

  @ManyToOne(() => Coupon, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon | null;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'discount_total', type: 'numeric', precision: 10, scale: 2, default: 0 })
  discountTotal: number;

  @Column({ name: 'shipping_fee', type: 'numeric', precision: 10, scale: 2, default: 0 })
  shippingFee: number;

  @Column({ name: 'tax_total', type: 'numeric', precision: 10, scale: 2, default: 0 })
  taxTotal: number;

  @Column({ name: 'grand_total', type: 'numeric', precision: 10, scale: 2 })
  grandTotal: number;

  @Column({ name: 'gift_wrap', type: 'boolean', default: false })
  giftWrap: boolean;

  @Column({ name: 'order_note', type: 'varchar', length: 300, nullable: true })
  orderNote: string | null;

  @Column({ name: 'placed_at', type: 'timestamptz' })
  placedAt: Date;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
