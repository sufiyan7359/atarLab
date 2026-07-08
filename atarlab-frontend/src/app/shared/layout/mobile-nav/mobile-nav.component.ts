import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartStore } from '../../../core/state/cart.store';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="mobile-nav">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
        <span>🏠</span><small>Home</small>
      </a>
      <a routerLink="/shop" routerLinkActive="active"><span>🔍</span><small>Shop</small></a>
      <a routerLink="/cart" routerLinkActive="active">
        <span class="cart-icon">
          🛍
          @if (cartStore.itemCount() > 0) {
            <em>{{ cartStore.itemCount() }}</em>
          }
        </span>
        <small>Cart</small>
      </a>
      <a routerLink="/account/orders" routerLinkActive="active"><span>👤</span><small>Account</small></a>
    </nav>
  `,
  styles: [
    `
      .mobile-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 90;
        display: flex;
        background: var(--bg-elevated);
        border-top: 1px solid var(--border);
        padding: 6px 0 max(6px, env(safe-area-inset-bottom));
        @media (min-width: 900px) {
          display: none;
        }
      }
      a {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        color: var(--text-secondary);
        font-size: 0.65rem;
        padding: 6px 0;
      }
      a.active {
        color: var(--accent-strong);
      }
      .cart-icon {
        position: relative;
      }
      .cart-icon em {
        position: absolute;
        top: -6px;
        right: -10px;
        background: var(--accent);
        color: var(--text-on-accent);
        font-style: normal;
        font-size: 0.6rem;
        font-weight: 700;
        border-radius: 999px;
        min-width: 14px;
        height: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class MobileNavComponent {
  cartStore = inject(CartStore);
}
