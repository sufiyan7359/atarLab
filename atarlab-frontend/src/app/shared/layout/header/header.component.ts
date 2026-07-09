import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/state/auth.store';
import { CartStore } from '../../../core/state/cart.store';
import { NotificationsStore } from '../../../core/state/notifications.store';
import { AppNotification } from '../../../core/models/tracking.model';
import { ThemeService } from '../../services/theme.service';
import { SearchBoxComponent } from '../search-box/search-box.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, SearchBoxComponent],
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

        <app-search-box />

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
          @if (authStore.isAuthenticated()) {
            <div class="notification-wrap">
              <button type="button" class="icon-btn" aria-label="Notifications" (click)="toggleNotifications()">
                🔔
                @if (notificationsStore.unreadCount() > 0) {
                  <span class="badge">{{ notificationsStore.unreadCount() }}</span>
                }
              </button>
              @if (notificationsOpen()) {
                <div class="backdrop" (click)="notificationsOpen.set(false)"></div>
                <div class="notification-panel">
                  <div class="panel-head">
                    <span>Notifications</span>
                    @if (notificationsStore.unreadCount() > 0) {
                      <button type="button" class="mark-all" (click)="notificationsStore.markAllRead()">Mark all read</button>
                    }
                  </div>
                  @if (notificationsStore.notifications().length === 0) {
                    <p class="empty">No notifications yet.</p>
                  } @else {
                    @for (n of notificationsStore.notifications(); track n.id) {
                      <button type="button" class="notification-item" [class.unread]="!n.isRead" (click)="openNotification(n)">
                        <span class="n-title">{{ n.title }}</span>
                        <span class="n-message">{{ n.message }}</span>
                      </button>
                    }
                  }
                </div>
              }
            </div>
          }
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
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-2) var(--space-6);
        min-height: 68px;
        padding-top: 8px;
        padding-bottom: 8px;
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
      .actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: var(--space-2);
        margin-left: auto;
        @media (min-width: 700px) {
          gap: var(--space-3);
        }
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
      .notification-wrap {
        position: relative;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        z-index: 199;
      }
      .notification-panel {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 320px;
        max-height: 420px;
        overflow-y: auto;
        background: var(--bg-elevated);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        box-shadow: 0 12px 32px rgb(0 0 0 / 0.18);
        z-index: 200;
      }
      .panel-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-3) var(--space-4);
        border-bottom: 1px solid var(--border);
        font-weight: 700;
        font-size: 0.9rem;
      }
      .mark-all {
        border: none;
        background: none;
        color: var(--accent-strong);
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
      }
      .empty {
        padding: var(--space-4);
        color: var(--text-secondary);
        font-size: 0.85rem;
        text-align: center;
      }
      .notification-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
        width: 100%;
        text-align: left;
        padding: var(--space-3) var(--space-4);
        border: none;
        border-bottom: 1px solid var(--border);
        background: none;
        cursor: pointer;
      }
      .notification-item:last-child {
        border-bottom: none;
      }
      .notification-item.unread {
        background: var(--bg-muted);
      }
      .n-title {
        font-size: 0.85rem;
        font-weight: 700;
      }
      .n-message {
        font-size: 0.8rem;
        color: var(--text-secondary);
      }
    `,
  ],
})
export class HeaderComponent {
  authStore = inject(AuthStore);
  cartStore = inject(CartStore);
  notificationsStore = inject(NotificationsStore);
  theme = inject(ThemeService);
  private readonly router = inject(Router);

  notificationsOpen = signal(false);
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

  toggleNotifications(): void {
    this.notificationsOpen.update((open) => !open);
  }

  openNotification(notification: AppNotification): void {
    this.notificationsOpen.set(false);
    if (!notification.isRead) void this.notificationsStore.markRead(notification.id);
    if (notification.orderId) this.router.navigate(['/account/orders', notification.orderId]);
  }
}
