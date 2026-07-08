import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { InventoryMovement } from '../products/entities/inventory-movement.entity';
import { InventoryReason } from '../../common/enums';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto';

const LOW_STOCK_THRESHOLD = 10;

export interface InventoryRow {
  id: string;
  sku: string;
  sizeMl: number;
  stockQuantity: number;
  isLowStock: boolean;
  product: { id: string; name: string; slug: string } | null;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(ProductVariant) private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(InventoryMovement) private readonly movementRepo: Repository<InventoryMovement>,
  ) {}

  async findAll(pagination: PaginationDto, lowStockOnly = false): Promise<PaginatedResult<InventoryRow>> {
    const qb = this.variantRepo
      .createQueryBuilder('variant')
      .innerJoinAndSelect('variant.product', 'product')
      .orderBy('variant.stockQuantity', 'ASC')
      .skip(pagination.skip)
      .take(pagination.limit);

    if (lowStockOnly) {
      qb.andWhere('variant.stockQuantity <= :threshold', { threshold: LOW_STOCK_THRESHOLD });
    }

    const [variants, total] = await qb.getManyAndCount();
    const items = variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      sizeMl: v.sizeMl,
      stockQuantity: v.stockQuantity,
      isLowStock: v.stockQuantity <= LOW_STOCK_THRESHOLD,
      product: v.product ? { id: v.product.id, name: v.product.name, slug: v.product.slug } : null,
    }));

    return { items, total, page: pagination.page, limit: pagination.limit };
  }

  getMovements(variantId: string, pagination: PaginationDto): Promise<PaginatedResult<InventoryMovement>> {
    return this.movementRepo
      .findAndCount({
        where: { variantId },
        order: { createdAt: 'DESC' },
        skip: pagination.skip,
        take: pagination.limit,
      })
      .then(([items, total]) => ({ items, total, page: pagination.page, limit: pagination.limit }));
  }

  async adjust(dto: AdjustInventoryDto, actorUserId: string): Promise<ProductVariant> {
    return this.dataSource.transaction(async (manager) => {
      const variantRepo = manager.getRepository(ProductVariant);
      const movementRepo = manager.getRepository(InventoryMovement);

      const variant = await variantRepo.findOne({ where: { id: dto.variantId } });
      if (!variant) throw new NotFoundException('Product variant not found');

      const newQuantity = variant.stockQuantity + dto.changeQty;
      if (newQuantity < 0) {
        throw new BadRequestException('Adjustment would result in negative stock');
      }

      variant.stockQuantity = newQuantity;
      await variantRepo.save(variant);

      await movementRepo.save(
        movementRepo.create({
          variantId: variant.id,
          changeQty: dto.changeQty,
          reason: InventoryReason.ADJUSTMENT,
          referenceType: 'manual_adjustment',
          referenceId: actorUserId,
        }),
      );

      return variant;
    });
  }
}
