import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Invoice } from './entities/invoice.entity';
import { CouponRedemption } from './entities/coupon-redemption.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { InventoryMovement } from '../products/entities/inventory-movement.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Payment } from '../payments/entities/payment.entity';
import { CheckoutDto } from './dto/checkout.dto';
import { CartService } from '../cart/cart.service';
import { CouponsService } from '../coupons/coupons.service';
import { PaymentsService } from '../payments/payments.service';
import { RazorpayProvider } from '../payments/providers/razorpay.provider';
import {
  InventoryReason,
  OrderStatus,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  PaymentTxnStatus,
} from '../../common/enums';
import { generateOrderNumber } from '../../common/utils/order-number.util';
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto';
import { AppConfig } from '../../config/configuration';
import { TrackingGateway } from '../tracking/tracking.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { OrderDeliveriesService } from '../delivery/order-deliveries.service';
import { DeliverySimulatorService } from '../delivery/delivery-simulator.service';

const STATUS_MESSAGES: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.CONFIRMED]: 'Your order has been confirmed.',
  [OrderStatus.PACKED]: 'Your order has been packed.',
  [OrderStatus.PICKED]: 'Your order has been picked up for shipping.',
  [OrderStatus.SHIPPED]: 'Your order is on its way.',
  [OrderStatus.OUT_FOR_DELIVERY]: 'Your order is out for delivery.',
  [OrderStatus.DELIVERED]: 'Your order has been delivered.',
  [OrderStatus.CANCELLED]: 'Your order has been cancelled.',
  [OrderStatus.RETURNED]: 'Your order has been returned.',
};

export interface CheckoutResult {
  order: Order;
  razorpay?: { orderId: string; amount: number; currency: string; keyId: string };
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderStatusHistory) private readonly historyRepo: Repository<OrderStatusHistory>,
    @InjectRepository(Invoice) private readonly invoiceRepo: Repository<Invoice>,
    private readonly cartService: CartService,
    private readonly couponsService: CouponsService,
    private readonly paymentsService: PaymentsService,
    private readonly razorpayProvider: RazorpayProvider,
    private readonly configService: ConfigService,
    private readonly trackingGateway: TrackingGateway,
    private readonly notificationsService: NotificationsService,
    private readonly orderDeliveriesService: OrderDeliveriesService,
    private readonly deliverySimulatorService: DeliverySimulatorService,
  ) {}

  async checkout(userId: string, dto: CheckoutDto): Promise<CheckoutResult> {
    const identity = { userId };
    const summary = await this.cartService.getSummary(identity);
    const { cart } = summary;

    if (!cart.items?.length) throw new BadRequestException('Cart is empty');

    return this.dataSource.transaction(async (manager) => {
      const variantRepo = manager.getRepository(ProductVariant);
      const movementRepo = manager.getRepository(InventoryMovement);
      const orderItemRepo = manager.getRepository(OrderItem);
      const orderRepo = manager.getRepository(Order);
      const redemptionRepo = manager.getRepository(CouponRedemption);

      const orderItems: OrderItem[] = [];
      for (const cartItem of cart.items) {
        const variant = await variantRepo
          .createQueryBuilder('variant')
          .innerJoinAndSelect('variant.product', 'product')
          .setLock('pessimistic_write')
          .where('variant.id = :id', { id: cartItem.variantId })
          .getOne();
        if (!variant) throw new NotFoundException('A product in your cart is no longer available');
        if (variant.stockQuantity < cartItem.quantity) {
          throw new BadRequestException(`Insufficient stock for one of the items in your cart`);
        }

        variant.stockQuantity -= cartItem.quantity;
        await variantRepo.save(variant);

        orderItems.push(
          orderItemRepo.create({
            variantId: variant.id,
            productNameSnapshot: variant.product.name,
            variantSnapshot: `${variant.sizeMl}ml`,
            unitPrice: variant.price,
            quantity: cartItem.quantity,
            lineTotal: Number(variant.price) * cartItem.quantity,
          }),
        );
      }

      const provider = dto.paymentMethod === PaymentMethod.COD ? PaymentProvider.COD : PaymentProvider.RAZORPAY;
      const initialStatus = provider === PaymentProvider.COD ? OrderStatus.CONFIRMED : OrderStatus.PENDING;

      let couponId: string | null = null;
      if (cart.couponCode) {
        const coupon = await this.couponsService.validateForSubtotal(cart.couponCode, summary.subtotal);
        couponId = coupon.id;
      }

      const order = await orderRepo.save(
        orderRepo.create({
          orderNumber: generateOrderNumber(),
          userId,
          status: initialStatus,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: dto.paymentMethod,
          shippingAddressId: dto.shippingAddressId,
          billingAddressId: dto.billingAddressId ?? dto.shippingAddressId,
          couponId,
          subtotal: summary.subtotal,
          discountTotal: summary.discount,
          shippingFee: summary.shippingFee,
          taxTotal: summary.taxTotal,
          grandTotal: summary.grandTotal,
          giftWrap: dto.giftWrap ?? false,
          orderNote: dto.orderNote ?? null,
          placedAt: new Date(),
          items: orderItems,
        }),
      );

      for (const item of order.items) {
        await movementRepo.save(
          movementRepo.create({
            variantId: item.variantId,
            changeQty: -item.quantity,
            reason: InventoryReason.ORDER,
            referenceType: 'order',
            referenceId: order.id,
          }),
        );
      }

      await manager.getRepository(OrderStatusHistory).save(
        manager.getRepository(OrderStatusHistory).create({
          orderId: order.id,
          status: initialStatus,
          note: provider === PaymentProvider.COD ? 'Order confirmed (Cash on Delivery)' : 'Order placed, awaiting payment',
        }),
      );

      if (couponId) {
        await redemptionRepo.save(redemptionRepo.create({ couponId, userId, orderId: order.id }));
        await this.couponsService.incrementUsage(couponId);
      }

      await manager.getRepository(Invoice).save(
        manager.getRepository(Invoice).create({
          orderId: order.id,
          invoiceNumber: `INV-${order.orderNumber}`,
        }),
      );

      const paymentRepo = manager.getRepository(Payment);
      const payment = await paymentRepo.save(
        paymentRepo.create({ orderId: order.id, provider, amount: summary.grandTotal }),
      );

      let razorpayInfo: CheckoutResult['razorpay'];
      if (provider === PaymentProvider.RAZORPAY) {
        const rpOrder = await this.razorpayProvider.createOrder(summary.grandTotal, 'INR', order.orderNumber);
        payment.providerOrderId = rpOrder.id;
        await paymentRepo.save(payment);
        const app = this.configService.get<AppConfig>('app')!;
        razorpayInfo = {
          orderId: rpOrder.id,
          amount: rpOrder.amount,
          currency: rpOrder.currency,
          keyId: app.razorpay.keyId,
        };
      }

      await manager.getRepository(CartItem).delete({ cartId: cart.id });
      await manager.getRepository(Cart).delete({ id: cart.id });

      return { order, razorpay: razorpayInfo };
    });
  }

  async findAllForUser(userId: string, pagination: PaginationDto): Promise<PaginatedResult<Order>> {
    const [items, total] = await this.orderRepo.findAndCount({
      where: { userId },
      relations: { items: true },
      order: { placedAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return { items, total, page: pagination.page, limit: pagination.limit };
  }

  async findOneOwned(id: string, userId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: { items: true, shippingAddress: true, billingAddress: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException();
    return order;
  }

  async findByIdAdmin(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: { items: true, shippingAddress: true, billingAddress: true, user: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findAllAdmin(pagination: PaginationDto): Promise<PaginatedResult<Order>> {
    const [items, total] = await this.orderRepo.findAndCount({
      relations: { items: true, user: true },
      order: { placedAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return { items, total, page: pagination.page, limit: pagination.limit };
  }

  async cancel(id: string, userId: string): Promise<Order> {
    const order = await this.findOneOwned(id, userId);
    return this.cancelInternal(order, 'Cancelled by customer', userId);
  }

  async adminCancel(id: string, actorUserId: string, note?: string): Promise<Order> {
    const order = await this.findByIdAdmin(id);
    return this.cancelInternal(order, note ?? 'Cancelled by admin', actorUserId);
  }

  private async cancelInternal(order: Order, note: string, actorUserId: string): Promise<Order> {
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
      throw new BadRequestException('This order can no longer be cancelled');
    }

    return this.dataSource.transaction(async (manager) => {
      const variantRepo = manager.getRepository(ProductVariant);
      const movementRepo = manager.getRepository(InventoryMovement);
      const orderItemRepo = manager.getRepository(OrderItem);
      const orderRepo = manager.getRepository(Order);

      const items = await orderItemRepo.find({ where: { orderId: order.id } });
      for (const item of items) {
        await variantRepo.increment({ id: item.variantId }, 'stockQuantity', item.quantity);
        await movementRepo.save(
          movementRepo.create({
            variantId: item.variantId,
            changeQty: item.quantity,
            reason: InventoryReason.RETURN,
            referenceType: 'order_cancelled',
            referenceId: order.id,
          }),
        );
      }

      if (order.paymentStatus === PaymentStatus.PAID) {
        const payment = await this.paymentsService.findByOrderId(order.id);
        if (payment?.providerPaymentId) {
          await this.razorpayProvider.refundPayment(payment.providerPaymentId, Number(order.grandTotal));
          await this.paymentsService.markStatus(payment.id, PaymentTxnStatus.REFUNDED);
        }
        order.paymentStatus = PaymentStatus.REFUNDED;
      }

      order.status = OrderStatus.CANCELLED;
      order.cancelledAt = new Date();
      await orderRepo.save(order);

      await manager.getRepository(OrderStatusHistory).save(
        manager.getRepository(OrderStatusHistory).create({
          orderId: order.id,
          status: OrderStatus.CANCELLED,
          note,
          changedByUserId: actorUserId,
        }),
      );

      return order;
    }).then(async (order) => {
      this.trackingGateway.emitOrderUpdate(order.id, { status: order.status, note, updatedAt: new Date() });
      this.deliverySimulatorService.stop(order.id);
      await this.notificationsService.create(
        order.userId,
        NotificationType.ORDER_STATUS,
        `Order ${order.orderNumber}`,
        STATUS_MESSAGES[OrderStatus.CANCELLED]!,
        order.id,
      );
      return order;
    });
  }

  async updateStatus(id: string, status: OrderStatus, note: string | undefined, actorUserId: string): Promise<Order> {
    const order = await this.findByIdAdmin(id);
    order.status = status;
    await this.orderRepo.save(order);
    await this.historyRepo.save(
      this.historyRepo.create({ orderId: order.id, status, note: note ?? null, changedByUserId: actorUserId }),
    );

    this.trackingGateway.emitOrderUpdate(order.id, { status, note: note ?? null, updatedAt: new Date() });
    await this.notificationsService.create(
      order.userId,
      NotificationType.ORDER_STATUS,
      `Order ${order.orderNumber}`,
      STATUS_MESSAGES[status] ?? `Order status updated to ${status}.`,
      order.id,
    );

    if (status === OrderStatus.OUT_FOR_DELIVERY) {
      await this.deliverySimulatorService.start(order.id);
    } else if (status === OrderStatus.DELIVERED) {
      this.deliverySimulatorService.stop(order.id);
      await this.orderDeliveriesService.markDelivered(order.id);
    }

    return order;
  }

  /** Marks an order as paid (from a verified payment or webhook) and confirms it if still pending. */
  async markPaid(orderId: string, note: string): Promise<Order> {
    const order = await this.findByIdAdmin(orderId);
    const wasPending = order.status === OrderStatus.PENDING;
    order.paymentStatus = PaymentStatus.PAID;
    if (wasPending) {
      order.status = OrderStatus.CONFIRMED;
    }
    await this.orderRepo.save(order);
    await this.historyRepo.save(
      this.historyRepo.create({ orderId: order.id, status: order.status, note }),
    );

    this.trackingGateway.emitOrderUpdate(order.id, { status: order.status, note, updatedAt: new Date() });
    if (wasPending) {
      await this.notificationsService.create(
        order.userId,
        NotificationType.ORDER_STATUS,
        `Order ${order.orderNumber}`,
        STATUS_MESSAGES[OrderStatus.CONFIRMED]!,
        order.id,
      );
    }
    return order;
  }

  getStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    return this.historyRepo.find({ where: { orderId }, order: { createdAt: 'ASC' } });
  }

  async getInvoice(orderId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({ where: { orderId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }
}
