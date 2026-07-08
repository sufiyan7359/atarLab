import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('newsletter_subscribers')
export class NewsletterSubscriber extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'citext' })
  email: string;
}
