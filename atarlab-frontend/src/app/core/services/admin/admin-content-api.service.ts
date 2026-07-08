import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { BlogPost, FaqItem, NewsletterSubscriber, SocialPost, Testimonial } from '../../models/content.model';

export type TestimonialPayload = Omit<Testimonial, 'id'>;
export type FaqPayload = Omit<FaqItem, 'id'>;
export type SocialPostPayload = Omit<SocialPost, 'id'>;
export type BlogPostPayload = Omit<BlogPost, 'id' | 'publishedAt' | 'createdAt'>;

@Injectable({ providedIn: 'root' })
export class AdminContentApiService {
  private readonly http = inject(HttpClient);

  // Testimonials
  listTestimonials(): Observable<ApiResponse<Testimonial[]>> {
    return this.http.get<ApiResponse<Testimonial[]>>('/admin/testimonials');
  }
  createTestimonial(payload: Partial<TestimonialPayload>): Observable<ApiResponse<Testimonial>> {
    return this.http.post<ApiResponse<Testimonial>>('/admin/testimonials', payload);
  }
  updateTestimonial(id: string, payload: Partial<TestimonialPayload>): Observable<ApiResponse<Testimonial>> {
    return this.http.patch<ApiResponse<Testimonial>>(`/admin/testimonials/${id}`, payload);
  }
  removeTestimonial(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/admin/testimonials/${id}`);
  }

  // FAQs
  listFaqs(): Observable<ApiResponse<FaqItem[]>> {
    return this.http.get<ApiResponse<FaqItem[]>>('/admin/faqs');
  }
  createFaq(payload: Partial<FaqPayload>): Observable<ApiResponse<FaqItem>> {
    return this.http.post<ApiResponse<FaqItem>>('/admin/faqs', payload);
  }
  updateFaq(id: string, payload: Partial<FaqPayload>): Observable<ApiResponse<FaqItem>> {
    return this.http.patch<ApiResponse<FaqItem>>(`/admin/faqs/${id}`, payload);
  }
  removeFaq(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/admin/faqs/${id}`);
  }

  // Social posts
  listSocialPosts(): Observable<ApiResponse<SocialPost[]>> {
    return this.http.get<ApiResponse<SocialPost[]>>('/admin/social-posts');
  }
  createSocialPost(payload: Partial<SocialPostPayload>): Observable<ApiResponse<SocialPost>> {
    return this.http.post<ApiResponse<SocialPost>>('/admin/social-posts', payload);
  }
  updateSocialPost(id: string, payload: Partial<SocialPostPayload>): Observable<ApiResponse<SocialPost>> {
    return this.http.patch<ApiResponse<SocialPost>>(`/admin/social-posts/${id}`, payload);
  }
  removeSocialPost(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/admin/social-posts/${id}`);
  }

  // Blog posts
  listBlogPosts(): Observable<ApiResponse<BlogPost[]>> {
    return this.http.get<ApiResponse<BlogPost[]>>('/admin/blog-posts');
  }
  createBlogPost(payload: Partial<BlogPostPayload>): Observable<ApiResponse<BlogPost>> {
    return this.http.post<ApiResponse<BlogPost>>('/admin/blog-posts', payload);
  }
  updateBlogPost(id: string, payload: Partial<BlogPostPayload>): Observable<ApiResponse<BlogPost>> {
    return this.http.patch<ApiResponse<BlogPost>>(`/admin/blog-posts/${id}`, payload);
  }
  removeBlogPost(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/admin/blog-posts/${id}`);
  }

  // Newsletter
  listSubscribers(): Observable<ApiResponse<NewsletterSubscriber[]>> {
    return this.http.get<ApiResponse<NewsletterSubscriber[]>>('/admin/newsletter-subscribers');
  }
  exportSubscribers(): Observable<Blob> {
    return this.http.get('/admin/newsletter-subscribers/export', { responseType: 'blob' });
  }
}
