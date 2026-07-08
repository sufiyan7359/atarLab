import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { OrderStatus, PaymentStatus } from '../../common/enums';

export type RevenueRange = 'week' | 'month' | 'year';

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockCount: number;
}

export interface RevenuePoint {
  bucket: string;
  revenue: number;
  orders: number;
}

export interface TopProductRow {
  productName: string;
  unitsSold: number;
  revenue: number;
}

const LOW_STOCK_THRESHOLD = 10;

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  async getSummary(): Promise<DashboardSummary> {
    const [{ sum }, totalOrders, totalCustomers, pendingOrders, lowStockCount] =
      await Promise.all([
        this.orderRepo
          .createQueryBuilder('order')
          .select('COALESCE(SUM(order.grandTotal), 0)', 'sum')
          .where('order.paymentStatus = :status', {
            status: PaymentStatus.PAID,
          })
          .getRawOne<{ sum: string }>()
          .then((r) => ({ sum: Number(r?.sum ?? 0) })),
        this.orderRepo.count(),
        this.userRepo.count(),
        this.orderRepo.count({ where: { status: OrderStatus.PENDING } }),
        this.variantRepo
          .createQueryBuilder('variant')
          .where('variant.stockQuantity <= :threshold', {
            threshold: LOW_STOCK_THRESHOLD,
          })
          .getCount(),
      ]);

    return {
      totalRevenue: sum,
      totalOrders,
      totalCustomers,
      pendingOrders,
      lowStockCount,
    };
  }

  async getRevenueSeries(range: RevenueRange): Promise<RevenuePoint[]> {
    const { truncUnit, days } = this.rangeToTrunc(range);

    const rows = await this.orderRepo
      .createQueryBuilder('order')
      .select(`date_trunc('${truncUnit}', order.placedAt)`, 'bucket')
      .addSelect('COALESCE(SUM(order.grandTotal), 0)', 'revenue')
      .addSelect('COUNT(*)', 'orders')
      .where("order.placedAt >= NOW() - INTERVAL '1 day' * :days", { days })
      .andWhere('order.paymentStatus = :status', { status: PaymentStatus.PAID })
      .groupBy('bucket')
      .orderBy('bucket', 'ASC')
      .getRawMany<{ bucket: Date; revenue: string; orders: string }>();

    return rows.map((r) => ({
      bucket: r.bucket.toISOString(),
      revenue: Number(r.revenue),
      orders: Number(r.orders),
    }));
  }

  async getTopProducts(limit = 10): Promise<TopProductRow[]> {
    const rows = await this.orderItemRepo
      .createQueryBuilder('item')
      .innerJoin('item.order', 'order')
      .select('item.productNameSnapshot', 'productName')
      .addSelect('SUM(item.quantity)', 'unitsSold')
      .addSelect('SUM(item.lineTotal)', 'revenue')
      .where('order.paymentStatus = :status', { status: PaymentStatus.PAID })
      .groupBy('item.productNameSnapshot')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(limit)
      .getRawMany<{
        productName: string;
        unitsSold: string;
        revenue: string;
      }>();

    return rows.map((r) => ({
      productName: r.productName,
      unitsSold: Number(r.unitsSold),
      revenue: Number(r.revenue),
    }));
  }

  async getTopCustomers(limit = 10): Promise<
    Array<{
      fullName: string;
      email: string | null;
      orders: number;
      totalSpent: number;
    }>
  > {
    const rows = await this.orderRepo
      .createQueryBuilder('order')
      .innerJoin('order.user', 'user')
      .select('user.fullName', 'fullName')
      .addSelect('user.email', 'email')
      .addSelect('COUNT(order.id)', 'orders')
      .addSelect('COALESCE(SUM(order.grandTotal), 0)', 'totalSpent')
      .where('order.paymentStatus = :status', { status: PaymentStatus.PAID })
      .groupBy('user.id')
      .addGroupBy('user.fullName')
      .addGroupBy('user.email')
      .orderBy('"totalSpent"', 'DESC')
      .limit(limit)
      .getRawMany<{
        fullName: string;
        email: string | null;
        orders: string;
        totalSpent: string;
      }>();

    return rows.map((r) => ({
      fullName: r.fullName,
      email: r.email,
      orders: Number(r.orders),
      totalSpent: Number(r.totalSpent),
    }));
  }

  async getSalesReport(
    from: Date,
    to: Date,
  ): Promise<{ orders: number; revenue: number }> {
    const result = await this.orderRepo
      .createQueryBuilder('order')
      .select('COUNT(*)', 'orders')
      .addSelect('COALESCE(SUM(order.grandTotal), 0)', 'revenue')
      .where('order.placedAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.paymentStatus = :status', { status: PaymentStatus.PAID })
      .getRawOne<{ orders: string; revenue: string }>();

    return {
      orders: Number(result?.orders ?? 0),
      revenue: Number(result?.revenue ?? 0),
    };
  }

  private rangeToTrunc(range: RevenueRange): {
    truncUnit: string;
    days: number;
  } {
    switch (range) {
      case 'year':
        return { truncUnit: 'month', days: 365 };
      case 'month':
        return { truncUnit: 'day', days: 30 };
      case 'week':
      default:
        return { truncUnit: 'day', days: 7 };
    }
  }
}
