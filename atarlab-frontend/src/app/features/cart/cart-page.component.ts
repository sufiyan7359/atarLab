import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartStore } from '../../core/state/cart.store';
import { AuthStore } from '../../core/state/auth.store';
import { ToastService } from '../../shared/services/toast.service';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';
import { QuantityStepperComponent } from '../../shared/components/quantity-stepper/quantity-stepper.component';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [RouterLink, FormsModule, InrCurrencyPipe, QuantityStepperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss',
})
export class CartPageComponent implements OnInit {
  cartStore = inject(CartStore);
  authStore = inject(AuthStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  couponCode = signal('');
  applyingCoupon = signal(false);

  async ngOnInit(): Promise<void> {
    await this.cartStore.refresh();
  }

  async updateQuantity(itemId: string, quantity: number): Promise<void> {
    await this.cartStore.updateItem(itemId, quantity);
  }

  async removeItem(itemId: string): Promise<void> {
    await this.cartStore.removeItem(itemId);
    this.toast.success('Item removed from cart');
  }

  async applyCoupon(): Promise<void> {
    if (!this.couponCode().trim()) return;
    this.applyingCoupon.set(true);
    try {
      await this.cartStore.applyCoupon(this.couponCode().trim());
      this.toast.success('Coupon applied');
    } catch {
      this.toast.error('Invalid or expired coupon code');
    } finally {
      this.applyingCoupon.set(false);
    }
  }

  async removeCoupon(): Promise<void> {
    await this.cartStore.removeCoupon();
  }

  goToCheckout(): void {
    if (!this.authStore.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { redirect: '/checkout' } });
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
