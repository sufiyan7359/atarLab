import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
  { label: 'Products', path: '/admin/products', icon: '🧴' },
  { label: 'Categories', path: '/admin/categories', icon: '📁' },
  { label: 'Brands', path: '/admin/brands', icon: '🏷️' },
  { label: 'Banners', path: '/admin/banners', icon: '🖼️' },
  { label: 'Coupons', path: '/admin/coupons', icon: '🎟️' },
  { label: 'Offers', path: '/admin/offers', icon: '💸' },
  { label: 'Inventory', path: '/admin/inventory', icon: '📦' },
  { label: 'Customers', path: '/admin/customers', icon: '👥' },
  { label: 'Orders', path: '/admin/orders', icon: '🧾' },
  { label: 'Reviews', path: '/admin/reviews', icon: '⭐' },
  { label: 'Reports', path: '/admin/reports', icon: '📈' },
  { label: 'Roles & Permissions', path: '/admin/roles', icon: '🔐' },
  { label: 'Activity Logs', path: '/admin/activity-logs', icon: '🕒' },
  { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
];

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-shell">
      <aside class="sidebar">
        <a routerLink="/admin/dashboard" class="brand">AtarLab <span>Admin</span></a>
        <nav>
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active">
              <span class="icon">{{ item.icon }}</span> {{ item.label }}
            </a>
          }
        </nav>
        <a routerLink="/" class="back-to-store">← Back to Store</a>
      </aside>
      <main class="admin-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .admin-shell {
        display: flex;
        min-height: 100vh;
        background: var(--bg-muted);
      }
      .sidebar {
        width: 240px;
        flex-shrink: 0;
        background: var(--bg-elevated);
        border-right: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        padding: var(--space-4) 0;
        position: sticky;
        top: 0;
        height: 100vh;
        overflow-y: auto;
      }
      .brand {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 1.15rem;
        padding: 0 var(--space-4) var(--space-4);
        color: var(--accent-strong);
        border-bottom: 1px solid var(--border);
        margin-bottom: var(--space-3);
      }
      .brand span {
        color: var(--text-secondary);
        font-weight: 400;
        font-size: 0.8rem;
      }
      nav {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
      }
      nav a {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px var(--space-4);
        color: var(--text-secondary);
        font-size: 0.9rem;
        font-weight: 500;
      }
      nav a.active {
        background: var(--bg-muted);
        color: var(--accent-strong);
        font-weight: 700;
        border-right: 3px solid var(--accent);
      }
      .icon {
        font-size: 1rem;
      }
      .back-to-store {
        padding: var(--space-4);
        font-size: 0.82rem;
        color: var(--text-secondary);
        border-top: 1px solid var(--border);
      }
      .admin-content {
        flex: 1;
        min-width: 0;
        padding: var(--space-6);
      }
    `,
  ],
})
export class AdminLayoutComponent {
  navItems = NAV_ITEMS;
}
