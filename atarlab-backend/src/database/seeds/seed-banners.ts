import { DataSource } from 'typeorm';
import {
  Banner,
  BannerPosition,
} from '../../modules/banners/entities/banner.entity';

const BANNERS: Array<{
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: BannerPosition;
  sortOrder: number;
}> = [
  {
    title: 'Winter Oud Collection',
    imageUrl: 'https://picsum.photos/seed/hero-oud/1600/700',
    linkUrl: '/shop?category=oud-collection',
    position: BannerPosition.HERO,
    sortOrder: 0,
  },
  {
    title: 'Pure Attars, Freshly Blended',
    imageUrl: 'https://picsum.photos/seed/hero-attars/1600/700',
    linkUrl: '/shop?category=pure-attars',
    position: BannerPosition.HERO,
    sortOrder: 1,
  },
  {
    title: 'Free shipping over ₹999',
    imageUrl: 'https://picsum.photos/seed/strip-shipping/1600/200',
    linkUrl: '/shop',
    position: BannerPosition.STRIP,
    sortOrder: 0,
  },
];

export async function seedBanners(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Banner);
  let created = 0;
  for (const b of BANNERS) {
    const existing = await repo.findOne({ where: { title: b.title } });
    if (existing) continue;
    await repo.save(repo.create(b));
    created += 1;
  }
  console.log(`Seeded ${created} new banners.`);
}
