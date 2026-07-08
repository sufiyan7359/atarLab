import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist, ProductVariant]), CartModule],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
