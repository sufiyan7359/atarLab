import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { WishlistApiService, WishlistItem } from '../../core/services/wishlist-api.service';
import { CartStore } from '../../core/state/cart.store';
import { ToastService } from '../../shared/services/toast.service';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [RouterLink, InrCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wishlist-page.component.html',
  styleUrl: './wishlist-page.component.scss',
})
export class WishlistPageComponent implements OnInit {
  private readonly wishlistApi = inject(WishlistApiService);
  private readonly cartStore = inject(CartStore);
  private readonly toast = inject(ToastService);

  items = signal<WishlistItem[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.wishlistApi.list());
      this.items.set(res.data);
    } finally {
      this.loading.set(false);
    }
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.wishlistApi.remove(id));
    this.items.update((list) => list.filter((i) => i.id !== id));
  }

  async moveToCart(id: string): Promise<void> {
    await firstValueFrom(this.wishlistApi.moveToCart(id));
    await this.cartStore.refresh();
    this.items.update((list) => list.filter((i) => i.id !== id));
    this.toast.success('Moved to cart');
  }
}
