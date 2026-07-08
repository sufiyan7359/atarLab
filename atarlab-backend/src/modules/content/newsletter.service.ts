import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscriber } from './entities/newsletter-subscriber.entity';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscriber)
    private readonly repo: Repository<NewsletterSubscriber>,
  ) {}

  async subscribe(email: string): Promise<NewsletterSubscriber> {
    const existing = await this.repo.findOne({ where: { email } });
    if (existing)
      throw new ConflictException('This email is already subscribed');
    return this.repo.save(this.repo.create({ email }));
  }

  findAll(): Promise<NewsletterSubscriber[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }
}
