import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ProductsService } from '../products/products.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/interfaces/auth.interface';

@ApiTags('Reviews')
@Controller('products/:slug/reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly productsService: ProductsService,
  ) {}

  @Public()
  @Get()
  async findAll(
    @Param('slug') slug: string,
    @Query() pagination: PaginationDto,
  ) {
    const product = await this.productsService.findBySlug(slug);
    return this.reviewsService.findApprovedForProduct(product.id, pagination);
  }

  @ApiBearerAuth()
  @Post()
  async create(
    @Param('slug') slug: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateReviewDto,
  ) {
    const product = await this.productsService.findBySlug(slug);
    return this.reviewsService.create(user.id, product.id, dto);
  }
}
