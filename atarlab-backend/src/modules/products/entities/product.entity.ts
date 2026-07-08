import { Column, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { Category } from '../../categories/entities/category.entity';
import { Gender, Concentration } from '../../../common/enums';
import { ProductVariant } from './product-variant.entity';
import { ProductImage } from './product-image.entity';
import { FragranceNote } from './fragrance-note.entity';
import { ProductIngredient } from './product-ingredient.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Index()
  @Column({ name: 'brand_id', type: 'uuid', nullable: true })
  brandId: string | null;

  @ManyToOne(() => Brand, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand | null;

  @Index()
  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 220, unique: true })
  slug: string;

  @Column({ name: 'short_description', type: 'varchar', length: 500, nullable: true })
  shortDescription: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 10, default: Gender.UNISEX })
  gender: Gender;

  @Column({ type: 'varchar', length: 20, nullable: true })
  concentration: Concentration | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  longevity: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  projection: string | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  season: string[];

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  occasion: string[];

  @Column({ name: 'base_price', type: 'numeric', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Index()
  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'avg_rating', type: 'numeric', precision: 3, scale: 2, default: 0 })
  avgRating: number;

  @Column({ name: 'review_count', type: 'int', default: 0 })
  reviewCount: number;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date | null;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  images: ProductImage[];

  @OneToMany(() => FragranceNote, (note) => note.product, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  fragranceNotes: FragranceNote[];

  @OneToMany(() => ProductIngredient, (ingredient) => ingredient.product, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  ingredients: ProductIngredient[];
}
