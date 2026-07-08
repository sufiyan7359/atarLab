import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum BannerPosition {
  HERO = 'HERO',
  STRIP = 'STRIP',
  POPUP = 'POPUP',
  CATEGORY = 'CATEGORY',
}

@Entity('banners')
export class Banner extends BaseEntity {
  @Column({ type: 'varchar', length: 150, nullable: true })
  title: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500 })
  imageUrl: string;

  @Column({ name: 'link_url', type: 'varchar', length: 500, nullable: true })
  linkUrl: string | null;

  @Column({ type: 'varchar', length: 20 })
  position: BannerPosition;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt: Date | null;

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
