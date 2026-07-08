import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import Razorpay from 'razorpay';
import { AppConfig } from '../../../config/configuration';

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

@Injectable()
export class RazorpayProvider {
  private readonly logger = new Logger(RazorpayProvider.name);
  private client: Razorpay | null = null;
  private keySecret: string;

  constructor(private readonly configService: ConfigService) {
    const app = this.configService.get<AppConfig>('app')!;
    this.keySecret = app.razorpay.keySecret;
    if (app.razorpay.keyId && app.razorpay.keySecret) {
      this.client = new Razorpay({
        key_id: app.razorpay.keyId,
        key_secret: app.razorpay.keySecret,
      });
    } else {
      this.logger.warn(
        'Razorpay keys not configured — running in sandbox no-op mode.',
      );
    }
  }

  async createOrder(
    amountInRupees: number,
    currency: string,
    receipt: string,
  ): Promise<RazorpayOrder> {
    const amount = Math.round(amountInRupees * 100);
    if (!this.client) {
      // Sandbox fallback so checkout still works end-to-end without live Razorpay keys.
      return { id: `order_sandbox_${receipt}`, amount, currency };
    }
    const order = await this.client.orders.create({
      amount,
      currency,
      receipt,
    });
    return {
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
    };
  }

  verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string,
  ): boolean {
    const expected = createHmac('sha256', this.keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    return expected === signature;
  }

  verifyWebhookSignature(
    rawBody: Buffer,
    signature: string,
    webhookSecret: string,
  ): boolean {
    const expected = createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');
    return expected === signature;
  }

  async refundPayment(
    providerPaymentId: string,
    amountInRupees: number,
  ): Promise<void> {
    if (!this.client || providerPaymentId.startsWith('pay_sandbox_')) {
      this.logger.log(
        `[SANDBOX] Skipping real refund call for ${providerPaymentId}`,
      );
      return;
    }
    await this.client.payments.refund(providerPaymentId, {
      amount: Math.round(amountInRupees * 100),
    });
  }
}
