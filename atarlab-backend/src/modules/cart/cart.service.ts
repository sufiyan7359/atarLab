import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartIdentity } from './interfaces/cart-identity.interface';
import { CouponsService } from '../coupons/coupons.service';
import {
  computeShippingFee,
  computeTax,
  round2,
} from '../../common/utils/pricing.util';

export interface CartSummary {
  cart: Cart;
  subtotal: number;
  discount: number;
  shippingFee: number;
  taxTotal: number;
  grandTotal: number;
}

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private readonly itemRepo: Repository<CartItem>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    private readonly couponsService: CouponsService,
  ) {}

  async getOrCreateCart(identity: CartIdentity): Promise<Cart> {
    this.assertIdentity(identity);
    let cart = await this.findCart(identity);
    if (!cart) {
      cart = await this.cartRepo.save(
        this.cartRepo.create({
          userId: identity.userId ?? null,
          sessionId: identity.sessionId ?? null,
        }),
      );
      cart.items = [];
    }
    return cart;
  }

  async addItem(identity: CartIdentity, dto: AddCartItemDto): Promise<Cart> {
    const variant = await this.variantRepo.findOne({
      where: { id: dto.variantId, isActive: true },
    });
    if (!variant) throw new NotFoundException('Product variant not found');

    const cart = await this.getOrCreateCart(identity);
    let item = cart.items?.find((i) => i.variantId === dto.variantId);

    if (item) {
      item.quantity = Math.min(item.quantity + dto.quantity, 20);
      item.giftWrap = dto.giftWrap ?? item.giftWrap;
      item.note = dto.note ?? item.note;
    } else {
      item = this.itemRepo.create({
        cartId: cart.id,
        variantId: dto.variantId,
        quantity: dto.quantity,
        giftWrap: dto.giftWrap ?? false,
        note: dto.note ?? null,
      });
    }
    this.assertStock(variant, item.quantity);
    await this.itemRepo.save(item);
    return this.getOrCreateCart(identity);
  }

  async updateItem(
    itemId: string,
    identity: CartIdentity,
    dto: UpdateCartItemDto,
  ): Promise<Cart> {
    const item = await this.getOwnedItem(itemId, identity);
    if (dto.quantity !== undefined) {
      this.assertStock(item.variant, dto.quantity);
      item.quantity = dto.quantity;
    }
    if (dto.giftWrap !== undefined) item.giftWrap = dto.giftWrap;
    if (dto.note !== undefined) item.note = dto.note;
    await this.itemRepo.save(item);
    return this.getOrCreateCart(identity);
  }

  async removeItem(itemId: string, identity: CartIdentity): Promise<Cart> {
    const item = await this.getOwnedItem(itemId, identity);
    await this.itemRepo.remove(item);
    return this.getOrCreateCart(identity);
  }

  async mergeGuestCartIntoUser(
    sessionId: string,
    userId: string,
  ): Promise<Cart> {
    const guestCart = await this.cartRepo.findOne({
      where: { sessionId },
      relations: { items: true },
    });
    if (!guestCart) return this.getOrCreateCart({ userId });

    const userCart = await this.getOrCreateCart({ userId });
    for (const guestItem of guestCart.items) {
      const existing = userCart.items?.find(
        (i) => i.variantId === guestItem.variantId,
      );
      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + guestItem.quantity,
          20,
        );
        await this.itemRepo.save(existing);
      } else {
        await this.itemRepo.save(
          this.itemRepo.create({
            cartId: userCart.id,
            variantId: guestItem.variantId,
            quantity: guestItem.quantity,
            giftWrap: guestItem.giftWrap,
            note: guestItem.note,
          }),
        );
      }
    }
    await this.cartRepo.remove(guestCart);
    return this.getOrCreateCart({ userId });
  }

  async applyCoupon(identity: CartIdentity, code: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(identity);
    const subtotal = this.computeSubtotal(cart);
    await this.couponsService.validateForSubtotal(code, subtotal);
    cart.couponCode = code.toUpperCase();
    return this.cartRepo.save(cart);
  }

  async removeCoupon(identity: CartIdentity): Promise<Cart> {
    const cart = await this.getOrCreateCart(identity);
    cart.couponCode = null;
    return this.cartRepo.save(cart);
  }

  async getSummary(identity: CartIdentity): Promise<CartSummary> {
    const cart = await this.getOrCreateCart(identity);
    const subtotal = this.computeSubtotal(cart);

    let discount = 0;
    if (cart.couponCode) {
      try {
        const coupon = await this.couponsService.validateForSubtotal(
          cart.couponCode,
          subtotal,
        );
        discount = this.couponsService.computeDiscount(coupon, subtotal);
      } catch {
        cart.couponCode = null;
        await this.cartRepo.save(cart);
      }
    }

    const taxableAmount = subtotal - discount;
    const shippingFee = computeShippingFee(taxableAmount);
    const taxTotal = computeTax(taxableAmount);
    const grandTotal = round2(taxableAmount + shippingFee + taxTotal);

    return { cart, subtotal, discount, shippingFee, taxTotal, grandTotal };
  }

  private computeSubtotal(cart: Cart): number {
    return round2(
      (cart.items ?? []).reduce(
        (sum, item) => sum + Number(item.variant.price) * item.quantity,
        0,
      ),
    );
  }

  private assertStock(variant: ProductVariant, quantity: number): void {
    if (quantity > variant.stockQuantity) {
      throw new BadRequestException(
        `Only ${variant.stockQuantity} units of this item are in stock`,
      );
    }
  }

  private async findCart(identity: CartIdentity): Promise<Cart | null> {
    const relations = { items: { variant: { product: { images: true } } } };
    if (identity.userId) {
      return this.cartRepo.findOne({
        where: { userId: identity.userId },
        relations,
      });
    }
    return this.cartRepo.findOne({
      where: { sessionId: identity.sessionId },
      relations,
    });
  }

  private async getOwnedItem(
    itemId: string,
    identity: CartIdentity,
  ): Promise<CartItem> {
    const item = await this.itemRepo.findOne({
      where: { id: itemId },
      relations: { cart: true, variant: true },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    const owns =
      (identity.userId && item.cart.userId === identity.userId) ||
      (identity.sessionId && item.cart.sessionId === identity.sessionId);
    if (!owns) throw new ForbiddenException();
    return item;
  }

  private assertIdentity(identity: CartIdentity): void {
    if (!identity.userId && !identity.sessionId) {
      throw new BadRequestException(
        'A session id or authentication is required to use the cart',
      );
    }
  }
}
