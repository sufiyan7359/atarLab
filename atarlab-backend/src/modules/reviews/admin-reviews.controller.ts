import { Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums';

@ApiTags('Admin: Reviews')
@ApiBearerAuth()
@Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.STAFF)
@Controller('admin/reviews')
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findPending(@Query() pagination: PaginationDto) {
    return this.reviewsService.findPendingAdmin(pagination);
  }

  @Patch(':id/approve')
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.approve(id);
  }

  @Patch(':id/reject')
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.reject(id);
  }
}
