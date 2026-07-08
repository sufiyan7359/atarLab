import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner, BannerPosition } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(@InjectRepository(Banner) private readonly repo: Repository<Banner>) {}

  async findActiveByPosition(position: BannerPosition): Promise<Banner[]> {
    const now = new Date();
    const banners = await this.repo.find({
      where: { position, isActive: true },
      order: { sortOrder: 'ASC' },
    });
    return banners.filter(
      (b) => (!b.startsAt || b.startsAt <= now) && (!b.endsAt || b.endsAt >= now),
    );
  }

  findAll(): Promise<Banner[]> {
    return this.repo.find({ order: { position: 'ASC', sortOrder: 'ASC' } });
  }

  async findById(id: string): Promise<Banner> {
    const banner = await this.repo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  create(dto: CreateBannerDto): Promise<Banner> {
    const banner = this.repo.create({
      ...dto,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    });
    return this.repo.save(banner);
  }

  async update(id: string, dto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.findById(id);
    Object.assign(banner, {
      ...dto,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : banner.startsAt,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : banner.endsAt,
    });
    return this.repo.save(banner);
  }

  async remove(id: string): Promise<void> {
    const banner = await this.findById(id);
    await this.repo.remove(banner);
  }
}
