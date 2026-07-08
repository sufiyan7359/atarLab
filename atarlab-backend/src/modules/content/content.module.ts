import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Testimonial } from './entities/testimonial.entity';
import { FaqItem } from './entities/faq-item.entity';
import { BlogPost } from './entities/blog-post.entity';
import { SocialPost } from './entities/social-post.entity';
import { NewsletterSubscriber } from './entities/newsletter-subscriber.entity';
import { ContentService } from './content.service';
import { NewsletterService } from './newsletter.service';
import { ContentController } from './content.controller';
import { AdminContentController } from './admin-content.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Testimonial,
      FaqItem,
      BlogPost,
      SocialPost,
      NewsletterSubscriber,
    ]),
  ],
  controllers: [ContentController, AdminContentController],
  providers: [ContentService, NewsletterService],
  exports: [ContentService, NewsletterService],
})
export class ContentModule {}
