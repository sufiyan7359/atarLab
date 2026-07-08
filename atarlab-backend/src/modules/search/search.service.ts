import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { Brand } from '../brands/entities/brand.entity';

const SIMILARITY_THRESHOLD = 0.3;

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Brand) private readonly brandRepo: Repository<Brand>,
  ) {}

  async suggest(q: string) {
    if (!q.trim()) return { products: [], categories: [], brands: [] };

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
        .where('category.isActive = true AND category.name ILIKE :like', {
          like,
        })
        .take(5)
        .getMany(),
      this.brandRepo
        .createQueryBuilder('brand')
        .where('brand.isActive = true AND brand.name ILIKE :like', { like })
        .take(5)
        .getMany(),
    ]);

    // A plain ILIKE finds nothing on a typo (e.g. "atarr") — fall back to pg_trgm
    // similarity so a near-miss still surfaces results instead of an empty dropdown.
    if (
      products.length === 0 &&
      categories.length === 0 &&
      brands.length === 0
    ) {
      return this.suggestFuzzy(q);
    }

    return { products, categories, brands };
  }

  private async suggestFuzzy(q: string) {
    const [products, categories, brands] = await Promise.all([
      this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.images', 'image')
        .addSelect('word_similarity(:q, product.name)', 'name_similarity')
        .where(
          'product.isActive = true AND word_similarity(:q, product.name) > :threshold',
          {
            q,
            threshold: SIMILARITY_THRESHOLD,
          },
        )
        .orderBy('name_similarity', 'DESC')
        .take(5)
        .getMany(),
      this.categoryRepo
        .createQueryBuilder('category')
        .addSelect('word_similarity(:q, category.name)', 'name_similarity')
        .where(
          'category.isActive = true AND word_similarity(:q, category.name) > :threshold',
          {
            q,
            threshold: SIMILARITY_THRESHOLD,
          },
        )
        .orderBy('name_similarity', 'DESC')
        .take(5)
        .getMany(),
      this.brandRepo
        .createQueryBuilder('brand')
        .addSelect('word_similarity(:q, brand.name)', 'name_similarity')
        .where(
          'brand.isActive = true AND word_similarity(:q, brand.name) > :threshold',
          {
            q,
            threshold: SIMILARITY_THRESHOLD,
          },
        )
        .orderBy('name_similarity', 'DESC')
        .take(5)
        .getMany(),
    ]);

    return { products, categories, brands };
  }
}
