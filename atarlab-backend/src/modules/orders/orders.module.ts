import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Invoice } from './entities/invoice.entity';
import { CouponRedemption } from './entities/coupon-redemption.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { InventoryMovement } from '../products/entities/inventory-movement.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { InvoicePdfService } from './invoice-pdf.service';
import { CartModule } from '../cart/cart.module';
import { CouponsModule } from '../coupons/coupons.module';
import { PaymentsModule } from '../payments/payments.module';
import { TrackingModule } from '../tracking/tracking.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DeliveryModule } from '../delivery/delivery.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderStatusHistory,
      Invoice,
      CouponRedemption,
      ProductVariant,
      InventoryMovement,
    ]),
    CartModule,
    CouponsModule,
    forwardRef(() => PaymentsModule),
    TrackingModule,
    NotificationsModule,
    DeliveryModule,
  ],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService, InvoicePdfService],
  exports: [OrdersService],
})
export class OrdersModule {}
