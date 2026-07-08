import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { OrdersService } from './orders.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { CheckoutDto } from './dto/checkout.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/interfaces/auth.interface';
import { OrderDeliveriesService } from '../delivery/order-deliveries.service';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly invoicePdfService: InvoicePdfService,
    private readonly orderDeliveriesService: OrderDeliveriesService,
  ) {}

  @Post('checkout')
  checkout(@CurrentUser() user: RequestUser, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: RequestUser, @Query() pagination: PaginationDto) {
    return this.ordersService.findAllForUser(user.id, pagination);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    const order = await this.ordersService.findOneOwned(id, user.id);
    const history = await this.ordersService.getStatusHistory(id);
    return { ...order, statusHistory: history };
  }

  @Get(':id/tracking')
  async tracking(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    const order = await this.ordersService.findOneOwned(id, user.id);
    const history = await this.ordersService.getStatusHistory(id);
    const delivery = await this.orderDeliveriesService.getByOrderId(id);
    return { status: order.status, statusHistory: history, delivery };
  }

  @Post(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    return this.ordersService.cancel(id, user.id);
  }

  @Get(':id/invoice')
  async invoice(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser, @Res() res: Response) {
    const order = await this.ordersService.findOneOwned(id, user.id);
    const invoiceRecord = await this.ordersService.getInvoice(id);
    const doc = this.invoicePdfService.generate(order, invoiceRecord);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${invoiceRecord.invoiceNumber}.pdf"`);
    doc.pipe(res);
  }
}
