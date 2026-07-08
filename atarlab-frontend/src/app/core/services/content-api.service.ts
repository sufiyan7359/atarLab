import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { BlogPost, FaqItem, SocialPost, Testimonial } from '../models/content.model';

@Injectable({ providedIn: 'root' })
export class ContentApiService {
  private readonly http = inject(HttpClient);

  getTestimonials(): Observable<ApiResponse<Testimonial[]>> {
    return this.http.get<ApiResponse<Testimonial[]>>('/testimonials');
  }

  getFaqs(): Observable<ApiResponse<FaqItem[]>> {
    return this.http.get<ApiResponse<FaqItem[]>>('/faqs');
  }

  getSocialPosts(): Observable<ApiResponse<SocialPost[]>> {
    return this.http.get<ApiResponse<SocialPost[]>>('/social-posts');
  }

  getBlogPosts(page = 1): Observable<ApiResponse<BlogPost[]>> {
    return this.http.get<ApiResponse<BlogPost[]>>('/blog', { params: { page, limit: 20 } });
  }

  getBlogPostBySlug(slug: string): Observable<ApiResponse<BlogPost>> {
    return this.http.get<ApiResponse<BlogPost>>(`/blog/${slug}`);
  }

  subscribeNewsletter(email: string): Observable<ApiResponse<{ id: string }>> {
    return this.http.post<ApiResponse<{ id: string }>>('/newsletter/subscribe', { email });
  }
}
