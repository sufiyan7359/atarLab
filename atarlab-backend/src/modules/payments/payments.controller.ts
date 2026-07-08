import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { RazorpayProvider } from './providers/razorpay.provider';
import { OrdersService } from '../orders/orders.service';
import { VerifyRazorpayPaymentDto } from '../orders/dto/verify-razorpay-payment.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/interfaces/auth.interface';
import { PaymentTxnStatus } from '../../common/enums';
import { AppConfig } from '../../config/configuration';

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: { id: string; order_id: string };
    };
  };
}

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly razorpayProvider: RazorpayProvider,
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
  ) {}

  @ApiBearerAuth()
  @Post('razorpay/verify')
  @HttpCode(HttpStatus.OK)
  async verify(
    @CurrentUser() user: RequestUser,
    @Body() dto: VerifyRazorpayPaymentDto,
  ) {
    const order = await this.ordersService.findOneOwned(dto.orderId, user.id);
    const payment = await this.paymentsService.findByOrderId(order.id);
    if (!payment)
      throw new BadRequestException('No payment record found for this order');

    const isValid = this.razorpayProvider.verifyPaymentSignature(
      dto.razorpayOrderId,
      dto.razorpayPaymentId,
      dto.razorpaySignature,
    );
    if (!isValid) throw new BadRequestException('Invalid payment signature');

    await this.paymentsService.markStatus(
      payment.id,
      PaymentTxnStatus.CAPTURED,
      dto.razorpayPaymentId,
    );
    const updated = await this.ordersService.markPaid(
      order.id,
      'Payment verified',
    );
    return { order: updated };
  }

  @Public()
  @Post('razorpay/webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const app = this.configService.get<AppConfig>('app')!;
    if (!req.rawBody || !signature)
      throw new BadRequestException('Missing webhook signature');

    const isValid = this.razorpayProvider.verifyWebhookSignature(
      req.rawBody,
      signature,
      app.razorpay.webhookSecret,
    );
    if (!isValid) throw new BadRequestException('Invalid webhook signature');

    const body = JSON.parse(
      req.rawBody.toString('utf8'),
    ) as RazorpayWebhookPayload;
    const paymentEntity = body.payload?.payment?.entity;
    if (!paymentEntity) return { received: true };

    const existing = await this.paymentsService.findByProviderPaymentId(
      paymentEntity.id,
    );
    if (existing && existing.status === PaymentTxnStatus.CAPTURED) {
      return { received: true }; // idempotent: already processed
    }

    const payment = await this.paymentsService.findByProviderOrderId(
      paymentEntity.order_id,
    );
    if (!payment) return { received: true };

    if (body.event === 'payment.captured') {
      await this.paymentsService.markStatus(
        payment.id,
        PaymentTxnStatus.CAPTURED,
        paymentEntity.id,
        body as unknown as Record<string, unknown>,
      );
      await this.ordersService.markPaid(
        payment.orderId,
        'Payment captured (webhook)',
      );
    } else if (body.event === 'payment.failed') {
      await this.paymentsService.markStatus(
        payment.id,
        PaymentTxnStatus.FAILED,
        paymentEntity.id,
        body as unknown as Record<string, unknown>,
      );
    }

    return { received: true };
  }
}
