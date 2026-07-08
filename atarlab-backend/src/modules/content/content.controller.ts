import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ContentService } from './content.service';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Content')
@Public()
@Controller()
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly newsletterService: NewsletterService,
  ) {}

  @Get('testimonials')
  testimonials() {
    return this.contentService.findActiveTestimonials();
  }

  @Get('faqs')
  faqs() {
    return this.contentService.findActiveFaqs();
  }

  @Get('social-posts')
  socialPosts() {
    return this.contentService.findActiveSocialPosts();
  }

  @Get('blog')
  blogList(@Query() pagination: PaginationDto) {
    return this.contentService.findPublishedBlogPosts(pagination);
  }

  @Get('blog/:slug')
  blogDetail(@Param('slug') slug: string) {
    return this.contentService.findPublishedBySlug(slug);
  }

  @Post('newsletter/subscribe')
  subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.newsletterService.subscribe(dto.email);
  }
}
