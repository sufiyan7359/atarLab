import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/state/auth.store';
import { CartStore } from '../../../core/state/cart.store';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="site-header">
      <div class="container bar">
        <a routerLink="/" class="logo">AtarLab</a>

        <nav class="nav-links">
          <a routerLink="/shop">Shop</a>
          <a routerLink="/shop" [queryParams]="{ category: 'oud-collection' }">Oud</a>
          <a routerLink="/shop" [queryParams]="{ category: 'pure-attars' }">Attars</a>
        </nav>

        <form class="search" (submit)="onSearch($event)">
          <input type="search" placeholder="Search fragrances…" [value]="query()" (input)="query.set($any($event.target).value)" />
        </form>

        <div class="actions">
          <button type="button" class="icon-btn" (click)="theme.toggle()" aria-label="Toggle theme">
            {{ theme.isDark() ? '☀️' : '🌙' }}
          </button>
          <a routerLink="/wishlist" class="icon-btn" aria-label="Wishlist">♡</a>
          <a routerLink="/cart" class="icon-btn cart-link" aria-label="Cart">
            🛍
            @if (cartStore.itemCount() > 0) {
              <span class="badge">{{ cartStore.itemCount() }}</span>
            }
          </a>
          @if (isAdmin()) {
            <a routerLink="/admin/dashboard" class="admin-link">Admin</a>
          }
          @if (authStore.isAuthenticated()) {
            <a routerLink="/account/orders" class="icon-btn" aria-label="Account">{{ initials() }}</a>
          } @else {
            <a routerLink="/auth/login" class="login-link">Sign in</a>
          }
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .site-header {
        position: sticky;
        top: 0;
        z-index: 100;
        background: var(--bg-elevated);
        border-bottom: 1px solid var(--border);
        backdrop-filter: saturate(180%) blur(8px);
      }
      .bar {
        display: flex;
        align-items: center;
        gap: var(--space-6);
        height: 68px;
      }
      .logo {
        font-family: var(--font-display);
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--accent-strong);
        white-space: nowrap;
      }
      .nav-links {
        display: none;
        gap: var(--space-6);
        font-weight: 500;
        @media (min-width: 900px) {
          display: flex;
        }
      }
      .search {
        flex: 1;
        display: none;
        @media (min-width: 700px) {
          display: block;
        }
      }
      .search input {
        width: 100%;
        max-width: 420px;
        padding: 8px 14px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: var(--bg-muted);
        color: var(--text-primary);
      }
      .actions {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-left: auto;
      }
      .icon-btn {
        position: relative;
        border: none;
        background: none;
        font-size: 1.15rem;
        cursor: pointer;
        color: var(--text-primary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
      }
      .badge {
        position: absolute;
        top: -2px;
        right: -2px;
        background: var(--accent);
        color: var(--text-on-accent);
        font-size: 0.65rem;
        font-weight: 700;
        min-width: 16px;
        height: 16px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 3px;
      }
      .login-link {
        font-weight: 600;
        color: var(--accent-strong);
        white-space: nowrap;
      }
      .admin-link {
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        color: var(--text-on-accent);
        background: var(--accent);
        padding: 6px 12px;
        border-radius: 999px;
        white-space: nowrap;
      }
      .admin-link:hover {
        background: var(--accent-strong);
      }
    `,
  ],
})
export class HeaderComponent {
  authStore = inject(AuthStore);
  cartStore = inject(CartStore);
  theme = inject(ThemeService);
  private readonly router = inject(Router);

  query = signal('');
  isAdmin = computed(() => this.authStore.hasRole('SUPER_ADMIN', 'ADMIN', 'STAFF'));
  initials = computed(() => {
    const name = this.authStore.user()?.fullName ?? '';
    return name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  onSearch(event: Event): void {
    event.preventDefault();
    const q = this.query().trim();
    if (q) this.router.navigate(['/search'], { queryParams: { q } });
  }
}
