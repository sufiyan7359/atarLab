import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ContentService } from './content.service';
import { NewsletterService } from './newsletter.service';
import { UpsertTestimonialDto } from './dto/upsert-testimonial.dto';
import { UpsertFaqDto } from './dto/upsert-faq.dto';
import { UpsertBlogPostDto } from './dto/upsert-blog-post.dto';
import { UpsertSocialPostDto } from './dto/upsert-social-post.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums';
import { toCsv } from '../../common/utils/csv.util';

@ApiTags('Admin: Content')
@ApiBearerAuth()
@Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.STAFF)
@Controller('admin')
export class AdminContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly newsletterService: NewsletterService,
  ) {}

  // Testimonials
  @Get('testimonials')
  listTestimonials() {
    return this.contentService.findAllTestimonials();
  }
  @Post('testimonials')
  createTestimonial(@Body() dto: UpsertTestimonialDto) {
    return this.contentService.createTestimonial(dto);
  }
  @Patch('testimonials/:id')
  updateTestimonial(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertTestimonialDto) {
    return this.contentService.updateTestimonial(id, dto);
  }
  @Delete('testimonials/:id')
  removeTestimonial(@Param('id', ParseUUIDPipe) id: string) {
    return this.contentService.removeTestimonial(id);
  }

  // FAQs
  @Get('faqs')
  listFaqs() {
    return this.contentService.findAllFaqs();
  }
  @Post('faqs')
  createFaq(@Body() dto: UpsertFaqDto) {
    return this.contentService.createFaq(dto);
  }
  @Patch('faqs/:id')
  updateFaq(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertFaqDto) {
    return this.contentService.updateFaq(id, dto);
  }
  @Delete('faqs/:id')
  removeFaq(@Param('id', ParseUUIDPipe) id: string) {
    return this.contentService.removeFaq(id);
  }

  // Social posts
  @Get('social-posts')
  listSocialPosts() {
    return this.contentService.findAllSocialPosts();
  }
  @Post('social-posts')
  createSocialPost(@Body() dto: UpsertSocialPostDto) {
    return this.contentService.createSocialPost(dto);
  }
  @Patch('social-posts/:id')
  updateSocialPost(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertSocialPostDto) {
    return this.contentService.updateSocialPost(id, dto);
  }
  @Delete('social-posts/:id')
  removeSocialPost(@Param('id', ParseUUIDPipe) id: string) {
    return this.contentService.removeSocialPost(id);
  }

  // Blog posts
  @Get('blog-posts')
  listBlogPosts() {
    return this.contentService.findAllBlogPosts();
  }
  @Get('blog-posts/:id')
  getBlogPost(@Param('id', ParseUUIDPipe) id: string) {
    return this.contentService.findBlogPostById(id);
  }
  @Post('blog-posts')
  createBlogPost(@Body() dto: UpsertBlogPostDto) {
    return this.contentService.createBlogPost(dto);
  }
  @Patch('blog-posts/:id')
  updateBlogPost(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertBlogPostDto) {
    return this.contentService.updateBlogPost(id, dto);
  }
  @Delete('blog-posts/:id')
  removeBlogPost(@Param('id', ParseUUIDPipe) id: string) {
    return this.contentService.removeBlogPost(id);
  }

  // Newsletter subscribers
  @Get('newsletter-subscribers')
  listSubscribers() {
    return this.newsletterService.findAll();
  }
  @Get('newsletter-subscribers/export')
  async exportSubscribers(@Res() res: Response) {
    const subscribers = await this.newsletterService.findAll();
    const csv = toCsv(subscribers.map((s) => ({ email: s.email, subscribedAt: s.createdAt })));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="newsletter-subscribers.csv"');
    res.send(csv);
  }
}
