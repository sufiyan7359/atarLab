import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums';
import { AnalyticsService } from './analytics.service';
import type { RevenueRange } from './analytics.service';

@ApiTags('Admin: Dashboard')
@ApiBearerAuth()
@Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.STAFF)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  getSummary() {
    return this.analyticsService.getSummary();
  }

  @Get('revenue')
  getRevenue(@Query('range') range: RevenueRange = 'month') {
    return this.analyticsService.getRevenueSeries(range);
  }
}
