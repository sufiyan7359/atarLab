import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartStore } from '../../../core/state/cart.store';
import { ToastService } from '../../services/toast.service';
import { InrCurrencyPipe } from '../../pipes/inr-currency.pipe';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, InrCurrencyPipe, RatingStarsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card">
      <a class="media" [routerLink]="['/product', product().slug]">
        @if (product().images[0]?.url) {
          <img [src]="product().images[0].url" [alt]="product().images[0].altText ?? product().name" loading="lazy" />
        }
        @if (compareAt()) {
          <span class="badge">Sale</span>
        }
      </a>
      <div class="body">
        @if (product().brand) {
          <p class="brand">{{ product().brand?.name }}</p>
        }
        <a [routerLink]="['/product', product().slug]" class="name">{{ product().name }}</a>
        <app-rating-stars [rating]="product().avgRating" [count]="product().reviewCount" />
        <div class="price-row">
          <span class="price">{{ startingPrice() | inr }}</span>
          @if (compareAt()) {
            <span class="compare">{{ compareAt() | inr }}</span>
          }
        </div>
        <button type="button" class="add-btn" (click)="quickAdd()">Add to Cart</button>
      </div>
    </article>
  `,
  styles: [
    `
      .card {
        display: flex;
        flex-direction: column;
        background: var(--bg-elevated);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        overflow: hidden;
        transition: box-shadow 0.2s ease, transform 0.2s ease;
      }
      .card:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }
      .media {
        position: relative;
        aspect-ratio: 4 / 5;
        background: var(--bg-muted);
        display: block;
      }
      .media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .badge {
        position: absolute;
        top: 10px;
        left: 10px;
        background: var(--accent);
        color: var(--text-on-accent);
        font-size: 0.7rem;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 999px;
      }
      .body {
        padding: var(--space-4);
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .brand {
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-secondary);
        margin: 0;
      }
      .name {
        font-family: var(--font-display);
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--text-primary);
        display: block;
        margin-bottom: 2px;
      }
      .price-row {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin: 4px 0 10px;
      }
      .price {
        font-weight: 700;
        color: var(--text-primary);
      }
      .compare {
        font-size: 0.8rem;
        color: var(--text-secondary);
        text-decoration: line-through;
      }
      .add-btn {
        border: 1px solid var(--accent);
        background: transparent;
        color: var(--accent-strong);
        padding: 8px 12px;
        border-radius: var(--radius-sm);
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease;
      }
      .add-btn:hover {
        background: var(--accent);
        color: var(--text-on-accent);
      }
    `,
  ],
})
export class ProductCardComponent {
  product = input.required<Product>();

  private readonly cartStore = inject(CartStore);
  private readonly toast = inject(ToastService);

  private readonly primaryVariant = computed(() => this.product().variants?.[0]);
  startingPrice = computed(() => this.primaryVariant()?.price ?? this.product().basePrice);
  compareAt = computed(() => this.primaryVariant()?.compareAtPrice ?? null);

  async quickAdd(): Promise<void> {
    const variant = this.primaryVariant();
    if (!variant) return;
    await this.cartStore.addItem(variant.id, 1);
    this.toast.success(`${this.product().name} added to cart`);
  }
}
