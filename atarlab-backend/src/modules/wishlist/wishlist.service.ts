import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { CartService } from '../cart/cart.service';
import { CartIdentity } from '../cart/interfaces/cart-identity.interface';
import { Cart } from '../cart/entities/cart.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist) private readonly repo: Repository<Wishlist>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    private readonly cartService: CartService,
  ) {}

  findAllForUser(userId: string): Promise<Wishlist[]> {
    return this.repo.find({
      where: { userId },
      relations: { product: { images: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async add(userId: string, dto: AddWishlistItemDto): Promise<Wishlist> {
    const existing = await this.repo.findOne({
      where: {
        userId,
        productId: dto.productId,
        variantId: dto.variantId ?? IsNull(),
      },
    });
    if (existing) return existing;

    const priceAtAdd = dto.variantId
      ? (await this.variantRepo.findOne({ where: { id: dto.variantId } }))
          ?.price
      : (await this.productRepo.findOne({ where: { id: dto.productId } }))
          ?.basePrice;

    const item = this.repo.create({
      userId,
      productId: dto.productId,
      variantId: dto.variantId ?? null,
      priceAtAdd: priceAtAdd ?? 0,
    });
    return this.repo.save(item);
  }

  async remove(id: string, userId: string): Promise<void> {
    const item = await this.getOwned(id, userId);
    await this.repo.remove(item);
  }

  async moveToCart(id: string, userId: string): Promise<Cart> {
    const item = await this.getOwned(id, userId);
    const variant = item.variantId
      ? await this.variantRepo.findOne({ where: { id: item.variantId } })
      : await this.variantRepo.findOne({
          where: { productId: item.productId, isActive: true },
        });
    if (!variant)
      throw new NotFoundException(
        'No purchasable variant found for this product',
      );

    const identity: CartIdentity = { userId };
    const cart = await this.cartService.addItem(identity, {
      variantId: variant.id,
      quantity: 1,
    });
    await this.repo.remove(item);
    return cart;
  }

  private async getOwned(id: string, userId: string): Promise<Wishlist> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Wishlist item not found');
    if (item.userId !== userId) throw new ForbiddenException();
    return item;
  }
}
