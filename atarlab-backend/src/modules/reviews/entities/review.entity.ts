import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('reviews')
@Unique(['productId', 'userId', 'orderItemId'])
export class Review extends BaseEntity {
  @Index()
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'order_item_id', type: 'uuid', nullable: true })
  orderItemId: string | null;

  @ManyToOne(() => OrderItem, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem | null;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  images: string[];

  @Column({ name: 'is_approved', type: 'boolean', default: false })
  isApproved: boolean;
}
