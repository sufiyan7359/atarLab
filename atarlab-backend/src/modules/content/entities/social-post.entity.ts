import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/** Stand-in for a live Instagram feed — there's no real Instagram Graph API
 *  integration in this sandbox, so admins curate this grid manually instead. */
@Entity('social_posts')
export class SocialPost extends BaseEntity {
  @Column({ name: 'image_url', type: 'varchar', length: 500 })
  imageUrl: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  caption: string | null;

  @Column({ name: 'link_url', type: 'varchar', length: 500, nullable: true })
  linkUrl: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
