import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../core/services/auth-api.service';
import { AuthStore } from '../../core/state/auth.store';
import { CartStore } from '../../core/state/cart.store';
import { NotificationsStore } from '../../core/state/notifications.store';

@Component({
  selector: 'app-account-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container account-layout">
      <nav class="account-nav">
        <a routerLink="/account/orders" routerLinkActive="active">Orders</a>
        <a routerLink="/account/addresses" routerLinkActive="active">Addresses</a>
        <a routerLink="/account/profile" routerLinkActive="active">Profile & Security</a>
        @if (isAdmin()) {
          <a routerLink="/admin/dashboard" class="admin-nav-link">Admin Dashboard →</a>
        }
        <button type="button" class="logout" (click)="logout()">Sign Out</button>
      </nav>
      <div class="account-content">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [
    `
      .account-layout {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--space-6);
        padding: var(--space-8) 0 var(--space-16);
        @media (min-width: 800px) {
          grid-template-columns: 200px 1fr;
        }
      }
      .account-nav {
        display: flex;
        flex-direction: row;
        gap: var(--space-2);
        overflow-x: auto;
        @media (min-width: 800px) {
          flex-direction: column;
        }
      }
      .account-nav a,
      .account-nav button {
        padding: 10px 14px;
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
        font-weight: 600;
        white-space: nowrap;
        border: none;
        background: none;
        cursor: pointer;
        text-align: left;
        font-size: 0.95rem;
      }
      .account-nav a.active {
        background: var(--bg-muted);
        color: var(--accent-strong);
      }
      .logout {
        color: var(--danger);
      }
      .admin-nav-link {
        color: var(--accent-strong) !important;
      }
    `,
  ],
})
export class AccountLayoutComponent {
  private readonly authStore = inject(AuthStore);
  private readonly authApi = inject(AuthApiService);
  private readonly cartStore = inject(CartStore);
  private readonly notificationsStore = inject(NotificationsStore);
  private readonly router = inject(Router);

  isAdmin = computed(() => this.authStore.hasRole('SUPER_ADMIN', 'ADMIN', 'STAFF'));

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.authApi.logout());
    } finally {
      this.authStore.clear();
      this.cartStore.clearLocal();
      this.notificationsStore.clear();
      this.router.navigate(['/']);
    }
  }
}
