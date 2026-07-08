import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { Public } from '../../common/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CartId } from './decorators/cart-identity.decorator';
import type { CartIdentity } from './interfaces/cart-identity.interface';

@ApiTags('Cart')
@Public()
@UseGuards(OptionalJwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CartId() identity: CartIdentity) {
    return this.cartService.getOrCreateCart(identity);
  }

  @Get('summary')
  getSummary(@CartId() identity: CartIdentity) {
    return this.cartService.getSummary(identity);
  }

  @Post('items')
  addItem(@CartId() identity: CartIdentity, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(identity, dto);
  }

  @Patch('items/:id')
  updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @CartId() identity: CartIdentity,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(id, identity, dto);
  }

  @Delete('items/:id')
  removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @CartId() identity: CartIdentity,
  ) {
    return this.cartService.removeItem(id, identity);
  }

  @Post('merge')
  mergeCart(
    @CartId() identity: CartIdentity,
    @Body('sessionId') sessionId: string,
  ) {
    if (!identity.userId)
      throw new UnauthorizedException('Login is required to merge a cart');
    return this.cartService.mergeGuestCartIntoUser(sessionId, identity.userId);
  }

  @Post('coupon')
  applyCoupon(@CartId() identity: CartIdentity, @Body() dto: ApplyCouponDto) {
    return this.cartService.applyCoupon(identity, dto.code);
  }

  @Delete('coupon')
  removeCoupon(@CartId() identity: CartIdentity) {
    return this.cartService.removeCoupon(identity);
  }
}
