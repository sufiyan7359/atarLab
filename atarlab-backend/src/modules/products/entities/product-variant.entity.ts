import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant extends BaseEntity {
  @Index()
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  @Column({ name: 'size_ml', type: 'int' })
  sizeMl: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'compare_at_price', type: 'numeric', precision: 10, scale: 2, nullable: true })
  compareAtPrice: number | null;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ name: 'weight_grams', type: 'int', nullable: true })
  weightGrams: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
