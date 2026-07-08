import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './entities/testimonial.entity';
import { FaqItem } from './entities/faq-item.entity';
import { BlogPost } from './entities/blog-post.entity';
import { SocialPost } from './entities/social-post.entity';
import { UpsertTestimonialDto } from './dto/upsert-testimonial.dto';
import { UpsertFaqDto } from './dto/upsert-faq.dto';
import { UpsertBlogPostDto } from './dto/upsert-blog-post.dto';
import { UpsertSocialPostDto } from './dto/upsert-social-post.dto';
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Testimonial) private readonly testimonialRepo: Repository<Testimonial>,
    @InjectRepository(FaqItem) private readonly faqRepo: Repository<FaqItem>,
    @InjectRepository(BlogPost) private readonly blogRepo: Repository<BlogPost>,
    @InjectRepository(SocialPost) private readonly socialRepo: Repository<SocialPost>,
  ) {}

  // Testimonials
  findActiveTestimonials(): Promise<Testimonial[]> {
    return this.testimonialRepo.find({ where: { isActive: true }, order: { sortOrder: 'ASC' } });
  }
  findAllTestimonials(): Promise<Testimonial[]> {
    return this.testimonialRepo.find({ order: { sortOrder: 'ASC' } });
  }
  createTestimonial(dto: UpsertTestimonialDto): Promise<Testimonial> {
    return this.testimonialRepo.save(this.testimonialRepo.create(dto));
  }
  async updateTestimonial(id: string, dto: UpsertTestimonialDto): Promise<Testimonial> {
    const row = await this.testimonialRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Testimonial not found');
    Object.assign(row, dto);
    return this.testimonialRepo.save(row);
  }
  async removeTestimonial(id: string): Promise<void> {
    await this.testimonialRepo.delete(id);
  }

  // FAQs
  findActiveFaqs(): Promise<FaqItem[]> {
    return this.faqRepo.find({ where: { isActive: true }, order: { sortOrder: 'ASC' } });
  }
  findAllFaqs(): Promise<FaqItem[]> {
    return this.faqRepo.find({ order: { sortOrder: 'ASC' } });
  }
  createFaq(dto: UpsertFaqDto): Promise<FaqItem> {
    return this.faqRepo.save(this.faqRepo.create(dto));
  }
  async updateFaq(id: string, dto: UpsertFaqDto): Promise<FaqItem> {
    const row = await this.faqRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('FAQ not found');
    Object.assign(row, dto);
    return this.faqRepo.save(row);
  }
  async removeFaq(id: string): Promise<void> {
    await this.faqRepo.delete(id);
  }

  // Social posts
  findActiveSocialPosts(): Promise<SocialPost[]> {
    return this.socialRepo.find({ where: { isActive: true }, order: { sortOrder: 'ASC' } });
  }
  findAllSocialPosts(): Promise<SocialPost[]> {
    return this.socialRepo.find({ order: { sortOrder: 'ASC' } });
  }
  createSocialPost(dto: UpsertSocialPostDto): Promise<SocialPost> {
    return this.socialRepo.save(this.socialRepo.create(dto));
  }
  async updateSocialPost(id: string, dto: UpsertSocialPostDto): Promise<SocialPost> {
    const row = await this.socialRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Social post not found');
    Object.assign(row, dto);
    return this.socialRepo.save(row);
  }
  async removeSocialPost(id: string): Promise<void> {
    await this.socialRepo.delete(id);
  }

  // Blog posts
  async findPublishedBlogPosts(pagination: PaginationDto): Promise<PaginatedResult<BlogPost>> {
    const [items, total] = await this.blogRepo.findAndCount({
      where: { isPublished: true },
      order: { publishedAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return { items, total, page: pagination.page, limit: pagination.limit };
  }
  async findPublishedBySlug(slug: string): Promise<BlogPost> {
    const post = await this.blogRepo.findOne({ where: { slug, isPublished: true } });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }
  findAllBlogPosts(): Promise<BlogPost[]> {
    return this.blogRepo.find({ order: { createdAt: 'DESC' } });
  }
  async findBlogPostById(id: string): Promise<BlogPost> {
    const post = await this.blogRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }
  createBlogPost(dto: UpsertBlogPostDto): Promise<BlogPost> {
    const publishedAt = dto.isPublished ? new Date() : null;
    return this.blogRepo.save(this.blogRepo.create({ ...dto, publishedAt }));
  }
  async updateBlogPost(id: string, dto: UpsertBlogPostDto): Promise<BlogPost> {
    const row = await this.findBlogPostById(id);
    const wasPublished = row.isPublished;
    Object.assign(row, dto);
    if (dto.isPublished && !wasPublished) row.publishedAt = new Date();
    if (dto.isPublished === false) row.publishedAt = null;
    return this.blogRepo.save(row);
  }
  async removeBlogPost(id: string): Promise<void> {
    await this.blogRepo.delete(id);
  }
}
