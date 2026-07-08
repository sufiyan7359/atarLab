import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  AdminContentApiService,
  BlogPostPayload,
  FaqPayload,
  SocialPostPayload,
  TestimonialPayload,
} from '../../../core/services/admin/admin-content-api.service';
import { UploadsApiService } from '../../../core/services/admin/uploads-api.service';
import { BlogPost, FaqItem, NewsletterSubscriber, SocialPost, Testimonial } from '../../../core/models/content.model';
import { ToastService } from '../../../shared/services/toast.service';
import { downloadBlob } from '../../../shared/utils/download-blob.util';

type Tab = 'testimonials' | 'faqs' | 'social' | 'blog' | 'newsletter';

const EMPTY_TESTIMONIAL: TestimonialPayload = { authorName: '', quote: '', rating: 5, sortOrder: 0, isActive: true };
const EMPTY_FAQ: FaqPayload = { question: '', answer: '', sortOrder: 0, isActive: true };
const EMPTY_SOCIAL: SocialPostPayload = { imageUrl: '', caption: '', linkUrl: '', sortOrder: 0, isActive: true };
const EMPTY_BLOG: BlogPostPayload = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  authorName: 'AtarLab Team',
  isPublished: false,
};

@Component({
  selector: 'app-admin-content',
  standalone: true,
  imports: [FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-content.component.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminContentComponent implements OnInit {
  private readonly api = inject(AdminContentApiService);
  private readonly uploadsApi = inject(UploadsApiService);
  private readonly toast = inject(ToastService);

  tab = signal<Tab>('testimonials');

  testimonials = signal<Testimonial[]>([]);
  faqs = signal<FaqItem[]>([]);
  socialPosts = signal<SocialPost[]>([]);
  blogPosts = signal<BlogPost[]>([]);
  subscribers = signal<NewsletterSubscriber[]>([]);

  showForm = signal(false);
  editingId = signal<string | null>(null);
  uploading = signal(false);

  testimonialForm: TestimonialPayload = { ...EMPTY_TESTIMONIAL };
  faqForm: FaqPayload = { ...EMPTY_FAQ };
  socialForm: SocialPostPayload = { ...EMPTY_SOCIAL };
  blogForm: BlogPostPayload = { ...EMPTY_BLOG };

  async ngOnInit(): Promise<void> {
    await this.loadAll();
  }

  private async loadAll(): Promise<void> {
    const [t, f, s, b, n] = await Promise.all([
      firstValueFrom(this.api.listTestimonials()),
      firstValueFrom(this.api.listFaqs()),
      firstValueFrom(this.api.listSocialPosts()),
      firstValueFrom(this.api.listBlogPosts()),
      firstValueFrom(this.api.listSubscribers()),
    ]);
    this.testimonials.set(t.data);
    this.faqs.set(f.data);
    this.socialPosts.set(s.data);
    this.blogPosts.set(b.data);
    this.subscribers.set(n.data);
  }

  setTab(tab: Tab): void {
    this.tab.set(tab);
    this.showForm.set(false);
  }

  // --- Testimonials ---
  startCreateTestimonial(): void {
    this.testimonialForm = { ...EMPTY_TESTIMONIAL };
    this.editingId.set(null);
    this.showForm.set(true);
  }
  startEditTestimonial(t: Testimonial): void {
    this.testimonialForm = { authorName: t.authorName, quote: t.quote, rating: t.rating, sortOrder: t.sortOrder, isActive: t.isActive };
    this.editingId.set(t.id);
    this.showForm.set(true);
  }
  async saveTestimonial(): Promise<void> {
    if (this.editingId()) await firstValueFrom(this.api.updateTestimonial(this.editingId()!, this.testimonialForm));
    else await firstValueFrom(this.api.createTestimonial(this.testimonialForm));
    this.toast.success('Testimonial saved');
    this.showForm.set(false);
    await this.loadAll();
  }
  async removeTestimonial(id: string): Promise<void> {
    await firstValueFrom(this.api.removeTestimonial(id));
    this.toast.success('Testimonial deleted');
    await this.loadAll();
  }

  // --- FAQs ---
  startCreateFaq(): void {
    this.faqForm = { ...EMPTY_FAQ };
    this.editingId.set(null);
    this.showForm.set(true);
  }
  startEditFaq(f: FaqItem): void {
    this.faqForm = { question: f.question, answer: f.answer, sortOrder: f.sortOrder, isActive: f.isActive };
    this.editingId.set(f.id);
    this.showForm.set(true);
  }
  async saveFaq(): Promise<void> {
    if (this.editingId()) await firstValueFrom(this.api.updateFaq(this.editingId()!, this.faqForm));
    else await firstValueFrom(this.api.createFaq(this.faqForm));
    this.toast.success('FAQ saved');
    this.showForm.set(false);
    await this.loadAll();
  }
  async removeFaq(id: string): Promise<void> {
    await firstValueFrom(this.api.removeFaq(id));
    this.toast.success('FAQ deleted');
    await this.loadAll();
  }

  // --- Social posts ---
  startCreateSocial(): void {
    this.socialForm = { ...EMPTY_SOCIAL };
    this.editingId.set(null);
    this.showForm.set(true);
  }
  startEditSocial(s: SocialPost): void {
    this.socialForm = { imageUrl: s.imageUrl, caption: s.caption ?? '', linkUrl: s.linkUrl ?? '', sortOrder: s.sortOrder, isActive: s.isActive };
    this.editingId.set(s.id);
    this.showForm.set(true);
  }
  async saveSocial(): Promise<void> {
    if (this.editingId()) await firstValueFrom(this.api.updateSocialPost(this.editingId()!, this.socialForm));
    else await firstValueFrom(this.api.createSocialPost(this.socialForm));
    this.toast.success('Social post saved');
    this.showForm.set(false);
    await this.loadAll();
  }
  async removeSocial(id: string): Promise<void> {
    await firstValueFrom(this.api.removeSocialPost(id));
    this.toast.success('Social post deleted');
    await this.loadAll();
  }

  // --- Blog posts ---
  startCreateBlog(): void {
    this.blogForm = { ...EMPTY_BLOG };
    this.editingId.set(null);
    this.showForm.set(true);
  }
  startEditBlog(b: BlogPost): void {
    this.blogForm = {
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content,
      coverImageUrl: b.coverImageUrl ?? '',
      authorName: b.authorName,
      isPublished: b.isPublished,
    };
    this.editingId.set(b.id);
    this.showForm.set(true);
  }
  async saveBlog(): Promise<void> {
    if (this.editingId()) await firstValueFrom(this.api.updateBlogPost(this.editingId()!, this.blogForm));
    else await firstValueFrom(this.api.createBlogPost(this.blogForm));
    this.toast.success('Blog post saved');
    this.showForm.set(false);
    await this.loadAll();
  }
  async removeBlog(id: string): Promise<void> {
    await firstValueFrom(this.api.removeBlogPost(id));
    this.toast.success('Blog post deleted');
    await this.loadAll();
  }

  slugify(): void {
    this.blogForm.slug = this.blogForm.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async onImageSelected(event: Event, target: 'social' | 'blog'): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    try {
      const res = await firstValueFrom(this.uploadsApi.uploadImage(file));
      if (target === 'social') this.socialForm.imageUrl = res.data.url;
      else this.blogForm.coverImageUrl = res.data.url;
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  async exportSubscribers(): Promise<void> {
    const blob = await firstValueFrom(this.api.exportSubscribers());
    downloadBlob(blob, 'newsletter-subscribers.csv');
  }
}
