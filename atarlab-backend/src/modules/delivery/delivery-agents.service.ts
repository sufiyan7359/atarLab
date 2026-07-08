import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryAgent } from './entities/delivery-agent.entity';
import { UpsertDeliveryAgentDto } from './dto/upsert-delivery-agent.dto';

@Injectable()
export class DeliveryAgentsService {
  constructor(@InjectRepository(DeliveryAgent) private readonly repo: Repository<DeliveryAgent>) {}

  findAll(): Promise<DeliveryAgent[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findActive(): Promise<DeliveryAgent[]> {
    return this.repo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<DeliveryAgent> {
    const agent = await this.repo.findOne({ where: { id } });
    if (!agent) throw new NotFoundException('Delivery agent not found');
    return agent;
  }

  create(dto: UpsertDeliveryAgentDto): Promise<DeliveryAgent> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpsertDeliveryAgentDto): Promise<DeliveryAgent> {
    const agent = await this.findOne(id);
    Object.assign(agent, dto);
    return this.repo.save(agent);
  }
}
