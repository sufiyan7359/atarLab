import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { AnalyticsService } from './analytics.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminReportsController } from './admin-reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, User, ProductVariant])],
  controllers: [AdminDashboardController, AdminReportsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
