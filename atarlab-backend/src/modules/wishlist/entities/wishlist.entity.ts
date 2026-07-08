import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

@Entity('wishlists')
@Unique(['userId', 'productId', 'variantId'])
export class Wishlist extends BaseEntity {
  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'variant_id', type: 'uuid', nullable: true })
  variantId: string | null;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant | null;

  /** Price at the moment this was added — lets the wishlist page flag a price drop. */
  @Column({ name: 'price_at_add', type: 'numeric', precision: 10, scale: 2 })
  priceAtAdd: number;
}
