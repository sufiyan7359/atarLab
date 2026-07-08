import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeliveryAgentsService } from './delivery-agents.service';
import { UpsertDeliveryAgentDto } from './dto/upsert-delivery-agent.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums';

@ApiTags('Admin: Delivery Agents')
@ApiBearerAuth()
@Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.STAFF)
@Controller('admin/delivery-agents')
export class AdminDeliveryAgentsController {
  constructor(private readonly agentsService: DeliveryAgentsService) {}

  @Get()
  findAll() {
    return this.agentsService.findAll();
  }

  @Post()
  create(@Body() dto: UpsertDeliveryAgentDto) {
    return this.agentsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertDeliveryAgentDto) {
    return this.agentsService.update(id, dto);
  }
}
