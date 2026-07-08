import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums';
import { ActivityLogsService } from './activity-logs.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Admin: Activity Logs')
@ApiBearerAuth()
@Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
@Controller('admin/activity-logs')
export class AdminActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('entityType') entityType?: string,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.activityLogsService.findAll(pagination, {
      entityType,
      actorUserId,
    });
  }
}
