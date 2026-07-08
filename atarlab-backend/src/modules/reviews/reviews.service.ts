import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ProductsService } from '../products/products.service';
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto';
import { OrderStatus } from '../../common/enums';

const UNREVIEWABLE_STATUSES = [OrderStatus.PENDING, OrderStatus.CANCELLED];

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
    @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
    private readonly productsService: ProductsService,
  ) {}

  async findApprovedForProduct(productId: string, pagination: PaginationDto): Promise<PaginatedResult<Review>> {
    const [items, total] = await this.reviewRepo.findAndCount({
      where: { productId, isApproved: true },
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return { items, total, page: pagination.page, limit: pagination.limit };
  }

  async create(userId: string, productId: string, dto: CreateReviewDto): Promise<Review> {
    const verifiedOrderItem = await this.orderItemRepo
      .createQueryBuilder('item')
      .innerJoin('item.variant', 'variant')
      .innerJoin('item.order', 'order')
      .where('variant.product_id = :productId', { productId })
      .andWhere('order.user_id = :userId', { userId })
      .andWhere('order.status NOT IN (:...statuses)', { statuses: UNREVIEWABLE_STATUSES })
      .getOne();

    const orderItemId = verifiedOrderItem?.id ?? null;

    const existing = await this.reviewRepo.findOne({ where: { productId, userId, orderItemId: orderItemId ?? IsNull() } });
    if (existing) throw new BadRequestException('You have already reviewed this product');

    const review = await this.reviewRepo.save(
      this.reviewRepo.create({
        productId,
        userId,
        orderItemId,
        rating: dto.rating,
        title: dto.title ?? null,
        comment: dto.comment ?? null,
        images: dto.images ?? [],
        isApproved: !!orderItemId, // verified purchases are auto-approved; others await moderation
      }),
    );

    if (review.isApproved) await this.recalculateProductRating(productId);
    return review;
  }

  async findPendingAdmin(pagination: PaginationDto): Promise<PaginatedResult<Review>> {
    const [items, total] = await this.reviewRepo.findAndCount({
      where: { isApproved: false },
      order: { createdAt: 'ASC' },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return { items, total, page: pagination.page, limit: pagination.limit };
  }

  async approve(id: string): Promise<Review> {
    const review = await this.getOrThrow(id);
    review.isApproved = true;
    await this.reviewRepo.save(review);
    await this.recalculateProductRating(review.productId);
    return review;
  }

  async reject(id: string): Promise<void> {
    const review = await this.getOrThrow(id);
    await this.reviewRepo.remove(review);
    await this.recalculateProductRating(review.productId);
  }

  private async recalculateProductRating(productId: string): Promise<void> {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('COALESCE(AVG(review.rating), 0)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('review.product_id = :productId AND review.is_approved = true', { productId })
      .getRawOne<{ avg: string; count: string }>();
    await this.productsService.recalculateRating(productId, Number(result?.avg ?? 0), Number(result?.count ?? 0));
  }

  private async getOrThrow(id: string): Promise<Review> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }
}
