import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentProvider, PaymentTxnStatus } from '../../common/enums';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly repo: Repository<Payment>,
  ) {}

  create(params: {
    orderId: string;
    provider: PaymentProvider;
    providerOrderId?: string;
    amount: number;
  }): Promise<Payment> {
    const payment = this.repo.create({
      orderId: params.orderId,
      provider: params.provider,
      providerOrderId: params.providerOrderId ?? null,
      amount: params.amount,
    });
    return this.repo.save(payment);
  }

  findByOrderId(orderId: string): Promise<Payment | null> {
    return this.repo.findOne({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  findByProviderPaymentId(providerPaymentId: string): Promise<Payment | null> {
    return this.repo.findOne({ where: { providerPaymentId } });
  }

  findByProviderOrderId(providerOrderId: string): Promise<Payment | null> {
    return this.repo.findOne({ where: { providerOrderId } });
  }

  async markStatus(
    id: string,
    status: PaymentTxnStatus,
    providerPaymentId?: string,
    rawResponse?: Record<string, unknown>,
  ): Promise<Payment> {
    const payment = await this.repo.findOneOrFail({ where: { id } });
    payment.status = status;
    if (providerPaymentId) payment.providerPaymentId = providerPaymentId;
    if (rawResponse) payment.rawResponse = rawResponse;
    return this.repo.save(payment);
  }
}
