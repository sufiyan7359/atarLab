import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand) private readonly repo: Repository<Brand>,
  ) {}

  findAll(): Promise<Brand[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<Brand> {
    const brand = await this.repo.findOne({ where: { slug } });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async findById(id: string): Promise<Brand> {
    const brand = await this.repo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  create(dto: CreateBrandDto): Promise<Brand> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findById(id);
    Object.assign(brand, dto);
    return this.repo.save(brand);
  }

  async remove(id: string): Promise<void> {
    const brand = await this.findById(id);
    await this.repo.remove(brand);
  }
}
