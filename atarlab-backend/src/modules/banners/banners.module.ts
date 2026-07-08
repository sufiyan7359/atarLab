import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entities/banner.entity';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { AdminBannersController } from './admin-banners.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Banner])],
  controllers: [BannersController, AdminBannersController],
  providers: [BannersService],
})
export class BannersModule {}
