import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { Brand } from '../brands/entities/brand.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Brand) private readonly brandRepo: Repository<Brand>,
  ) {}

  async suggest(q: string) {
    const like = `%${q}%`;
    const [products, categories, brands] = await Promise.all([
      this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.images', 'image')
        .where('product.isActive = true AND product.name ILIKE :like', { like })
        .take(5)
        .getMany(),
      this.categoryRepo
        .createQueryBuilder('category')
        .where('category.isActive = true AND category.name ILIKE :like', { like })
        .take(5)
        .getMany(),
      this.brandRepo
        .createQueryBuilder('brand')
        .where('brand.isActive = true AND brand.name ILIKE :like', { like })
        .take(5)
        .getMany(),
    ]);

    return { products, categories, brands };
  }
}
