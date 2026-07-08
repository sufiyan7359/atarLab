import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto';
import { TrackingGateway } from '../tracking/tracking.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly repo: Repository<Notification>,
    private readonly trackingGateway: TrackingGateway,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    orderId?: string,
  ): Promise<Notification> {
    const notification = await this.repo.save(
      this.repo.create({ userId, type, title, message, orderId: orderId ?? null }),
    );
    this.trackingGateway.emitNotification(userId, notification);
    return notification;
  }

  async findAllForUser(userId: string, pagination: PaginationDto): Promise<PaginatedResult<Notification>> {
    const [items, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return { items, total, page: pagination.page, limit: pagination.limit };
  }

  unreadCount(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, isRead: false } });
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.repo.update({ id, userId }, { isRead: true });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
  }
}
