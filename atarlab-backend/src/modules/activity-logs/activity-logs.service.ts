import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import {
  PaginatedResult,
  PaginationDto,
} from '../../common/dto/pagination.dto';

export interface RecordActivityParams {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  after?: Record<string, unknown> | null;
  ip?: string | null;
}

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly repo: Repository<ActivityLog>,
  ) {}

  async record(params: RecordActivityParams): Promise<void> {
    await this.repo.save(
      this.repo.create({
        actorUserId: params.actorUserId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        after: params.after ?? null,
        ip: params.ip ?? null,
      }),
    );
  }

  async findAll(
    pagination: PaginationDto,
    filters: { entityType?: string; actorUserId?: string } = {},
  ): Promise<PaginatedResult<ActivityLog>> {
    const [items, total] = await this.repo.findAndCount({
      where: {
        ...(filters.entityType ? { entityType: filters.entityType } : {}),
        ...(filters.actorUserId ? { actorUserId: filters.actorUserId } : {}),
      },
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return { items, total, page: pagination.page, limit: pagination.limit };
  }
}
