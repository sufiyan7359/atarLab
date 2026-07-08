import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CartApiService } from '../services/cart-api.service';
import { CartSummary } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly cartApi = inject(CartApiService);

  private readonly _summary = signal<CartSummary | null>(null);
  private readonly _loading = signal(false);

  readonly summary = this._summary.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly itemCount = computed(
    () => this._summary()?.cart.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  );

  async refresh(): Promise<void> {
    this._loading.set(true);
    try {
      const res = await firstValueFrom(this.cartApi.getSummary());
      this._summary.set(res.data);
    } catch {
      // A guest with no session yet (e.g. during SSR bootstrap) has no cart to fetch — that's fine.
      this._summary.set(null);
    } finally {
      this._loading.set(false);
    }
  }

  async addItem(variantId: string, quantity: number): Promise<void> {
    await firstValueFrom(this.cartApi.addItem(variantId, quantity));
    await this.refresh();
  }

  async updateItem(itemId: string, quantity: number): Promise<void> {
    await firstValueFrom(this.cartApi.updateItem(itemId, quantity));
    await this.refresh();
  }

  async removeItem(itemId: string): Promise<void> {
    await firstValueFrom(this.cartApi.removeItem(itemId));
    await this.refresh();
  }

  async applyCoupon(code: string): Promise<void> {
    await firstValueFrom(this.cartApi.applyCoupon(code));
    await this.refresh();
  }

  async removeCoupon(): Promise<void> {
    await firstValueFrom(this.cartApi.removeCoupon());
    await this.refresh();
  }

  async mergeGuestCart(sessionId: string): Promise<void> {
    await firstValueFrom(this.cartApi.mergeGuestCart(sessionId));
    await this.refresh();
  }

  clearLocal(): void {
    this._summary.set(null);
  }
}
