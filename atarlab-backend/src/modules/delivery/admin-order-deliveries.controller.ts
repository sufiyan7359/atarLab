import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrderDeliveriesService } from './order-deliveries.service';
import { AssignAgentDto } from './dto/assign-agent.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums';

@ApiTags('Admin: Order Deliveries')
@ApiBearerAuth()
@Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.STAFF)
@Controller('admin/orders/:orderId/delivery')
export class AdminOrderDeliveriesController {
  constructor(private readonly deliveriesService: OrderDeliveriesService) {}

  @Get()
  get(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.deliveriesService.getByOrderId(orderId);
  }

  @Post('assign')
  assign(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: AssignAgentDto,
  ) {
    return this.deliveriesService.assignAgent(
      orderId,
      dto.agentId,
      dto.etaMinutes,
    );
  }
}
