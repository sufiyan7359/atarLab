import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProductsApiService } from '../../../core/services/products-api.service';
import { Product, ProductVariant, Review } from '../../../core/models/product.model';
import { CartStore } from '../../../core/state/cart.store';
import { WishlistApiService } from '../../../core/services/wishlist-api.service';
import { AuthStore } from '../../../core/state/auth.store';
import { ToastService } from '../../../shared/services/toast.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { RatingStarsComponent } from '../../../shared/components/rating-stars/rating-stars.component';
import { QuantityStepperComponent } from '../../../shared/components/quantity-stepper/quantity-stepper.component';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

type DetailTab = 'description' | 'notes' | 'ingredients' | 'reviews';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [FormsModule, ProductCardComponent, RatingStarsComponent, QuantityStepperComponent, InrCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productsApi = inject(ProductsApiService);
  private readonly cartStore = inject(CartStore);
  private readonly wishlistApi = inject(WishlistApiService);
  private readonly toast = inject(ToastService);
  authStore = inject(AuthStore);

  product = signal<(Product & { related: Product[]; frequentlyBoughtTogether: Product[] }) | null>(null);
  loading = signal(true);
  activeImageIndex = signal(0);
  selectedVariant = signal<ProductVariant | null>(null);
  quantity = signal(1);
  activeTab = signal<DetailTab>('description');
  reviews = signal<Review[]>([]);

  newRating = signal(5);
  newTitle = signal('');
  newComment = signal('');
  submittingReview = signal(false);

  hasProduct = computed(() => !!this.product());

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(async (params) => {
      const slug = params.get('slug');
      if (!slug) return;
      await this.loadProduct(slug);
    });
  }

  private async loadProduct(slug: string): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.productsApi.getBySlug(slug));
      this.product.set(res.data);
      this.selectedVariant.set(res.data.variants?.[0] ?? null);
      this.activeImageIndex.set(0);
      const reviewsRes = await firstValueFrom(this.productsApi.getReviews(slug));
      this.reviews.set(reviewsRes.data);
    } finally {
      this.loading.set(false);
    }
  }

  selectVariant(variant: ProductVariant): void {
    this.selectedVariant.set(variant);
  }

  async addToCart(): Promise<void> {
    const variant = this.selectedVariant();
    if (!variant) return;
    await this.cartStore.addItem(variant.id, this.quantity());
    this.toast.success(`${this.product()!.name} added to cart`);
  }

  async addToWishlist(): Promise<void> {
    if (!this.authStore.isAuthenticated()) {
      this.toast.error('Please sign in to save items to your wishlist');
      return;
    }
    await firstValueFrom(this.wishlistApi.add(this.product()!.id, this.selectedVariant()?.id));
    this.toast.success('Added to wishlist');
  }

  async submitReview(): Promise<void> {
    if (!this.authStore.isAuthenticated()) {
      this.toast.error('Please sign in to write a review');
      return;
    }
    this.submittingReview.set(true);
    try {
      await firstValueFrom(
        this.productsApi.addReview(this.product()!.slug, {
          rating: this.newRating(),
          title: this.newTitle() || undefined,
          comment: this.newComment() || undefined,
        }),
      );
      this.toast.success('Thank you for your review!');
      this.newTitle.set('');
      this.newComment.set('');
      const reviewsRes = await firstValueFrom(this.productsApi.getReviews(this.product()!.slug));
      this.reviews.set(reviewsRes.data);
    } catch {
      this.toast.error('You may have already reviewed this product, or need to purchase it first.');
    } finally {
      this.submittingReview.set(false);
    }
  }
}
