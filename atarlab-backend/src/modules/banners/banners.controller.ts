import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { BannersService } from './banners.service';
import { BannerPosition } from './entities/banner.entity';

@ApiTags('Banners')
@Public()
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  findByPosition(
    @Query('position') position: BannerPosition = BannerPosition.HERO,
  ) {
    return this.bannersService.findActiveByPosition(position);
  }
}
