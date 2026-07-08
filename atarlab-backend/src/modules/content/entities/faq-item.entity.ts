import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('faq_items')
export class FaqItem extends BaseEntity {
  @Column({ type: 'varchar', length: 300 })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
