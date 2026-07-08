import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums';
import { AnalyticsService } from './analytics.service';
import { toCsv } from '../../common/utils/csv.util';

@ApiTags('Admin: Reports')
@ApiBearerAuth()
@Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
@Controller('admin/reports')
export class AdminReportsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('sales')
  async getSales(@Query('from') from?: string, @Query('to') to?: string) {
    const fromDate = from
      ? new Date(from)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();
    return this.analyticsService.getSalesReport(fromDate, toDate);
  }

  @Get('top-products')
  async getTopProducts(
    @Res() res: Response,
    @Query('limit') limit?: string,
    @Query('format') format?: string,
  ) {
    const rows = await this.analyticsService.getTopProducts(
      limit ? parseInt(limit, 10) : 10,
    );
    if (format === 'csv') {
      return this.sendCsv(res, rows, 'top-products.csv');
    }
    res.json({ success: true, data: rows });
  }

  @Get('customers')
  async getTopCustomers(
    @Res() res: Response,
    @Query('limit') limit?: string,
    @Query('format') format?: string,
  ) {
    const rows = await this.analyticsService.getTopCustomers(
      limit ? parseInt(limit, 10) : 10,
    );
    if (format === 'csv') {
      return this.sendCsv(res, rows, 'top-customers.csv');
    }
    res.json({ success: true, data: rows });
  }

  private sendCsv<T extends object>(
    res: Response,
    rows: T[],
    filename: string,
  ): void {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(toCsv(rows));
  }
}
