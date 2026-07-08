import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('testimonials')
export class Testimonial extends BaseEntity {
  @Column({ name: 'author_name', type: 'varchar', length: 150 })
  authorName: string;

  @Column({ type: 'varchar', length: 500 })
  quote: string;

  @Column({ type: 'smallint', default: 5 })
  rating: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
