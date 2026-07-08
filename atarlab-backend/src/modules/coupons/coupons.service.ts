import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponType } from '../../common/enums';
import { round2 } from '../../common/utils/pricing.util';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon) private readonly repo: Repository<Coupon>,
  ) {}

  async validateForSubtotal(code: string, subtotal: number): Promise<Coupon> {
    const coupon = await this.repo.findOne({
      where: { code: code.toUpperCase() },
    });
    if (!coupon || !coupon.isActive)
      throw new BadRequestException('Invalid coupon code');

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now)
      throw new BadRequestException('Coupon is not active yet');
    if (coupon.expiresAt && coupon.expiresAt < now)
      throw new BadRequestException('Coupon has expired');
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }
    if (subtotal < Number(coupon.minOrderValue)) {
      throw new BadRequestException(
        `Minimum order value for this coupon is ${coupon.minOrderValue}`,
      );
    }
    return coupon;
  }

  computeDiscount(coupon: Coupon, subtotal: number): number {
    if (coupon.type === CouponType.PERCENTAGE) {
      const raw = (subtotal * Number(coupon.value)) / 100;
      const capped =
        coupon.maxDiscount !== null
          ? Math.min(raw, Number(coupon.maxDiscount))
          : raw;
      return round2(capped);
    }
    return round2(Math.min(Number(coupon.value), subtotal));
  }

  async incrementUsage(couponId: string): Promise<void> {
    await this.repo.increment({ id: couponId }, 'usedCount', 1);
  }

  findAll(): Promise<Coupon[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Coupon> {
    const coupon = await this.repo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  create(dto: CreateCouponDto): Promise<Coupon> {
    const coupon = this.repo.create({
      ...dto,
      code: dto.code.toUpperCase(),
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });
    return this.repo.save(coupon);
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findById(id);
    Object.assign(coupon, {
      ...dto,
      code: dto.code ? dto.code.toUpperCase() : coupon.code,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : coupon.startsAt,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : coupon.expiresAt,
    });
    return this.repo.save(coupon);
  }

  async remove(id: string): Promise<void> {
    const coupon = await this.findById(id);
    await this.repo.remove(coupon);
  }
}
