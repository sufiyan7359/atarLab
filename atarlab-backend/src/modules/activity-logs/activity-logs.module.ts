import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityLogsService } from './activity-logs.service';
import { AdminActivityLogsController } from './admin-activity-logs.controller';
import { ActivityLogInterceptor } from './activity-log.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog])],
  controllers: [AdminActivityLogsController],
  providers: [ActivityLogsService, ActivityLogInterceptor],
  exports: [ActivityLogsService, ActivityLogInterceptor],
})
export class ActivityLogsModule {}
