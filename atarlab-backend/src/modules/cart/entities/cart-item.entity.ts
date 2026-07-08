import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Cart } from './cart.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

@Entity('cart_items')
@Unique(['cartId', 'variantId'])
export class CartItem extends BaseEntity {
  @Index()
  @Column({ name: 'cart_id', type: 'uuid' })
  cartId: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'gift_wrap', type: 'boolean', default: false })
  giftWrap: boolean;

  @Column({ type: 'varchar', length: 300, nullable: true })
  note: string | null;
}
