import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { FragranceNote } from './entities/fragrance-note.entity';
import { ProductIngredient } from './entities/product-ingredient.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';

const FBT_LIMIT = 4;

const DETAIL_RELATIONS = {
  brand: true,
  category: true,
  variants: true,
  images: true,
  fragranceNotes: true,
  ingredients: true,
} as const;

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant) private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductImage) private readonly imageRepo: Repository<ProductImage>,
    @InjectRepository(FragranceNote) private readonly noteRepo: Repository<FragranceNote>,
    @InjectRepository(ProductIngredient) private readonly ingredientRepo: Repository<ProductIngredient>,
    @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
  ) {}

  async findAll(
    query: QueryProductsDto,
    options: { includeInactive?: boolean } = {},
  ): Promise<PaginatedResult<Product>> {
    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoinAndSelect('product.images', 'image');

    if (!options.includeInactive) {
      qb.where('product.isActive = true');
    } else {
      qb.where('1=1');
    }

    if (query.category) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug: query.category });
    }
    if (query.brand) {
      qb.andWhere('brand.slug = :brandSlug', { brandSlug: query.brand });
    }
    if (query.gender) {
      qb.andWhere('product.gender = :gender', { gender: query.gender });
    }
    if (query.concentration) {
      qb.andWhere('product.concentration = :concentration', { concentration: query.concentration });
    }
    if (query.season) {
      qb.andWhere(':season = ANY(product.season)', { season: query.season });
    }
    if (query.occasion) {
      qb.andWhere(':occasion = ANY(product.occasion)', { occasion: query.occasion });
    }
    if (query.minPrice !== undefined) {
      qb.andWhere('product.basePrice >= :minPrice', { minPrice: query.minPrice });
    }
    if (query.maxPrice !== undefined) {
      qb.andWhere('product.basePrice <= :maxPrice', { maxPrice: query.maxPrice });
    }
    if (query.rating !== undefined) {
      qb.andWhere('product.avgRating >= :rating', { rating: query.rating });
    }
    if (query.q) {
      qb.andWhere('(product.name ILIKE :q OR product.description ILIKE :q)', { q: `%${query.q}%` });
    }

    switch (query.sort) {
      case 'price_asc':
        qb.orderBy('product.basePrice', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('product.basePrice', 'DESC');
        break;
      case 'rating':
        qb.orderBy('product.avgRating', 'DESC');
        break;
      case 'bestseller':
        qb.orderBy('product.reviewCount', 'DESC');
        break;
      case 'newest':
      default:
        qb.orderBy('product.createdAt', 'DESC');
    }

    qb.skip(query.skip).take(query.limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page: query.page, limit: query.limit };
  }

  async findBySlug(slug: string): Promise<Product & { related: Product[]; frequentlyBoughtTogether: Product[] }> {
    const product = await this.productRepo.findOne({
      where: { slug, isActive: true },
      relations: DETAIL_RELATIONS,
    });
    if (!product) throw new NotFoundException('Product not found');

    // Independent of each other — load-testing findBySlug showed these adding up
    // sequentially (each product-detail view was paying for both round-trips back to
    // back); running them concurrently instead cuts that to whichever is slower.
    const [related, frequentlyBoughtTogether] = await Promise.all([
      product.categoryId
        ? this.productRepo.find({
            where: { categoryId: product.categoryId, isActive: true },
            relations: { images: true, variants: true },
            take: 8,
          })
        : Promise.resolve([]),
      this.findFrequentlyBoughtTogether(product),
    ]);

    return {
      ...product,
      related: related.filter((p) => p.id !== product.id).slice(0, 8),
      frequentlyBoughtTogether,
    };
  }

  /** Ranks other products by how often they've shipped in the same order as this one.
   *  Falls back to filling remaining slots from the same category when purchase history
   *  is too sparse (e.g. a brand-new product) to have any real co-occurrence signal. */
  private async findFrequentlyBoughtTogether(product: Product): Promise<Product[]> {
    const coPurchased = await this.orderItemRepo
      .createQueryBuilder('oi1')
      .innerJoin('order_items', 'oi2', 'oi2.order_id = oi1.order_id AND oi2.variant_id != oi1.variant_id')
      .innerJoin('product_variants', 'v1', 'v1.id = oi1.variant_id')
      .innerJoin('product_variants', 'v2', 'v2.id = oi2.variant_id')
      .where('v1.product_id = :productId', { productId: product.id })
      .andWhere('v2.product_id != :productId', { productId: product.id })
      .select('v2.product_id', 'productId')
      .addSelect('COUNT(DISTINCT oi1.order_id)', 'coCount')
      .groupBy('v2.product_id')
      .orderBy('"coCount"', 'DESC')
      .limit(FBT_LIMIT)
      .getRawMany<{ productId: string; coCount: string }>();

    const ids = coPurchased.map((row) => row.productId);
    const products = ids.length
      ? await this.productRepo.find({ where: { id: In(ids), isActive: true }, relations: { images: true, variants: true } })
      : [];
    const ordered = ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p);

    if (ordered.length >= FBT_LIMIT || !product.categoryId) return ordered;

    const excludeIds = [product.id, ...ordered.map((p) => p.id)];
    const fallback = await this.productRepo.find({
      where: { categoryId: product.categoryId, isActive: true, id: Not(In(excludeIds)) },
      relations: { images: true, variants: true },
      take: FBT_LIMIT - ordered.length,
    });

    return [...ordered, ...fallback];
  }

  async findByIdAdmin(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id }, relations: DETAIL_RELATIONS });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create({
      name: dto.name,
      slug: dto.slug,
      brandId: dto.brandId ?? null,
      categoryId: dto.categoryId ?? null,
      shortDescription: dto.shortDescription ?? null,
      description: dto.description ?? null,
      gender: dto.gender,
      concentration: dto.concentration,
      longevity: dto.longevity,
      projection: dto.projection,
      season: dto.season ?? [],
      occasion: dto.occasion ?? [],
      basePrice: dto.basePrice,
      isActive: dto.isActive ?? true,
      isFeatured: dto.isFeatured ?? false,
      variants: dto.variants.map((v) => this.variantRepo.create(v)),
      images: dto.images?.map((i) => this.imageRepo.create(i)) ?? [],
      fragranceNotes: dto.fragranceNotes?.map((n) => this.noteRepo.create(n)) ?? [],
      ingredients: dto.ingredients?.map((name) => this.ingredientRepo.create({ name })) ?? [],
    });
    return this.productRepo.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findByIdAdmin(id);
    const { variants, images, fragranceNotes, ingredients, ...scalarFields } = dto;
    Object.assign(product, scalarFields);
    if (variants) product.variants = variants.map((v) => this.variantRepo.create(v));
    if (images) product.images = images.map((i) => this.imageRepo.create(i));
    if (fragranceNotes) product.fragranceNotes = fragranceNotes.map((n) => this.noteRepo.create(n));
    if (ingredients) product.ingredients = ingredients.map((name) => this.ingredientRepo.create({ name }));
    return this.productRepo.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findByIdAdmin(id);
    await this.productRepo.softRemove(product);
  }

  async recalculateRating(productId: string, avgRating: number, reviewCount: number): Promise<void> {
    await this.productRepo.update(productId, { avgRating, reviewCount });
  }

  findVariantById(variantId: string): Promise<ProductVariant | null> {
    return this.variantRepo.findOne({ where: { id: variantId }, relations: { product: true } });
  }
}
