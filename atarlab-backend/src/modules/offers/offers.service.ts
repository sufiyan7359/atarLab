import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OffersService {
  constructor(@InjectRepository(Offer) private readonly repo: Repository<Offer>) {}

  async findActive(): Promise<Offer[]> {
    const now = new Date();
    const offers = await this.repo.find({
      where: { isActive: true },
      relations: { category: true, brand: true, product: true },
      order: { createdAt: 'DESC' },
    });
    return offers.filter(
      (o) => (!o.startsAt || o.startsAt <= now) && (!o.endsAt || o.endsAt >= now),
    );
  }

  findAll(): Promise<Offer[]> {
    return this.repo.find({
      relations: { category: true, brand: true, product: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Offer> {
    const offer = await this.repo.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  create(dto: CreateOfferDto): Promise<Offer> {
    const offer = this.repo.create({
      ...dto,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    });
    return this.repo.save(offer);
  }

  async update(id: string, dto: UpdateOfferDto): Promise<Offer> {
    const offer = await this.findById(id);
    Object.assign(offer, {
      ...dto,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : offer.startsAt,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : offer.endsAt,
    });
    return this.repo.save(offer);
  }

  async remove(id: string): Promise<void> {
    const offer = await this.findById(id);
    await this.repo.remove(offer);
  }
}
