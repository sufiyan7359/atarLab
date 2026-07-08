import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProductsApiService } from '../../core/services/products-api.service';
import { CatalogApiService } from '../../core/services/catalog-api.service';
import { ContentApiService } from '../../core/services/content-api.service';
import { Product, Category } from '../../core/models/product.model';
import { Testimonial, FaqItem, SocialPost, BlogPost } from '../../core/models/content.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly productsApi = inject(ProductsApiService);
  private readonly catalogApi = inject(CatalogApiService);
  private readonly contentApi = inject(ContentApiService);
  private readonly toast = inject(ToastService);

  featured = signal<Product[]>([]);
  bestSellers = signal<Product[]>([]);
  newArrivals = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  testimonials = signal<Testimonial[]>([]);
  faqs = signal<FaqItem[]>([]);
  socialPosts = signal<SocialPost[]>([]);
  blogPosts = signal<BlogPost[]>([]);
  loading = signal(true);

  newsletterEmail = '';
  subscribing = signal(false);

  async ngOnInit(): Promise<void> {
    try {
      const [featuredRes, bestSellersRes, newArrivalsRes, categoriesRes, testimonialsRes, faqsRes, socialRes, blogRes] =
        await Promise.all([
          firstValueFrom(this.productsApi.list({ limit: 8, sort: 'newest' })),
          firstValueFrom(this.productsApi.list({ limit: 8, sort: 'bestseller' })),
          firstValueFrom(this.productsApi.list({ limit: 8, sort: 'newest' })),
          firstValueFrom(this.catalogApi.getCategories()),
          firstValueFrom(this.contentApi.getTestimonials()),
          firstValueFrom(this.contentApi.getFaqs()),
          firstValueFrom(this.contentApi.getSocialPosts()),
          firstValueFrom(this.contentApi.getBlogPosts()),
        ]);
      this.featured.set(featuredRes.data.filter((p) => p.isFeatured).slice(0, 8) || featuredRes.data.slice(0, 8));
      this.bestSellers.set(bestSellersRes.data);
      this.newArrivals.set(newArrivalsRes.data);
      this.categories.set(categoriesRes.data);
      this.testimonials.set(testimonialsRes.data);
      this.faqs.set(faqsRes.data);
      this.socialPosts.set(socialRes.data);
      this.blogPosts.set(blogRes.data.slice(0, 3));
    } finally {
      this.loading.set(false);
    }
  }

  async subscribeNewsletter(event: Event): Promise<void> {
    event.preventDefault();
    const email = this.newsletterEmail.trim();
    if (!email) return;
    this.subscribing.set(true);
    try {
      await firstValueFrom(this.contentApi.subscribeNewsletter(email));
      this.toast.success('You\'re subscribed! Watch your inbox for new drops.');
      this.newsletterEmail = '';
    } catch {
      this.toast.error('Could not subscribe — check the email and try again.');
    } finally {
      this.subscribing.set(false);
    }
  }
}
