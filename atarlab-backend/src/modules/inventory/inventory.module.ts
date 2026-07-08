import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { InventoryMovement } from '../products/entities/inventory-movement.entity';
import { InventoryService } from './inventory.service';
import { AdminInventoryController } from './admin-inventory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductVariant, InventoryMovement])],
  controllers: [AdminInventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
