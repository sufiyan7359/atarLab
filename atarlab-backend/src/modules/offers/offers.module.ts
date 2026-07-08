import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { AdminOffersController } from './admin-offers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Offer])],
  controllers: [OffersController, AdminOffersController],
  providers: [OffersService],
})
export class OffersModule {}
