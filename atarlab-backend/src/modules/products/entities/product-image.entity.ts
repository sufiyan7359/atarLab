import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('product_images')
export class ProductImage extends BaseEntity {
  @Index()
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'variant_id', type: 'uuid', nullable: true })
  variantId: string | null;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant | null;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ name: 'alt_text', type: 'varchar', length: 200, nullable: true })
  altText: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}
