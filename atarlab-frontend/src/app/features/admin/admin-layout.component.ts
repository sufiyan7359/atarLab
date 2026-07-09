import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  { label: 'Delivery Agents', path: '/admin/delivery-agents', icon: '🛵' },
  { label: 'Customers', path: '/admin/customers', icon: '👥' },
  { label: 'Orders', path: '/admin/orders', icon: '🧾' },
  { label: 'Reviews', path: '/admin/reviews', icon: '⭐' },
  { label: 'Content', path: '/admin/content', icon: '📝' },
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
      <header class="mobile-topbar">
        <button type="button" class="menu-btn" aria-label="Open menu" (click)="sidebarOpen.set(true)">☰</button>
        <a routerLink="/admin/dashboard" class="brand">AtarLab <span>Admin</span></a>
      </header>

      @if (sidebarOpen()) {
        <div class="backdrop" (click)="sidebarOpen.set(false)"></div>
      }

      <aside class="sidebar" [class.open]="sidebarOpen()">
        <div class="sidebar-head">
          <a routerLink="/admin/dashboard" class="brand">AtarLab <span>Admin</span></a>
          <button type="button" class="close-btn" aria-label="Close menu" (click)="sidebarOpen.set(false)">✕</button>
        </div>
        <nav>
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active" (click)="sidebarOpen.set(false)">
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
      .mobile-topbar {
        display: none;
        align-items: center;
        gap: var(--space-3);
        position: sticky;
        top: 0;
        z-index: 120;
        width: 100%;
        background: var(--bg-elevated);
        border-bottom: 1px solid var(--border);
        padding: var(--space-3) var(--space-4);
      }
      .menu-btn {
        border: none;
        background: none;
        font-size: 1.3rem;
        line-height: 1;
        cursor: pointer;
        color: var(--text-primary);
        padding: 4px;
      }
      .backdrop {
        display: none;
        position: fixed;
        inset: 0;
        background: rgb(0 0 0 / 0.4);
        z-index: 130;
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
      .sidebar-head {
        display: none;
        align-items: center;
        justify-content: space-between;
        padding: 0 var(--space-4) var(--space-4);
        border-bottom: 1px solid var(--border);
        margin-bottom: var(--space-3);
      }
      .close-btn {
        border: none;
        background: none;
        font-size: 1.1rem;
        cursor: pointer;
        color: var(--text-secondary);
      }
      .brand {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 1.15rem;
        padding: 0 var(--space-4) var(--space-4);
        color: var(--accent-strong);
        border-bottom: 1px solid var(--border);
        margin-bottom: var(--space-3);
        white-space: nowrap;
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

      @media (max-width: 899px) {
        .admin-shell {
          display: block;
        }
        .mobile-topbar {
          display: flex;
        }
        .mobile-topbar .brand {
          padding: 0;
          border-bottom: none;
          margin-bottom: 0;
          font-size: 1rem;
        }
        .backdrop {
          display: block;
        }
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100dvh;
          z-index: 140;
          transform: translateX(-100%);
          transition: transform 0.2s ease;
          box-shadow: var(--shadow-lg);
        }
        .sidebar.open {
          transform: translateX(0);
        }
        .sidebar > .brand {
          display: none;
        }
        .sidebar-head {
          display: flex;
        }
        .sidebar-head .brand {
          padding: 0;
          border-bottom: none;
          margin-bottom: 0;
        }
        .admin-content {
          padding: var(--space-4);
        }
      }
    `,
  ],
})
export class AdminLayoutComponent {
  navItems = NAV_ITEMS;
  sidebarOpen = signal(false);

  constructor(router: Router) {
    router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.sidebarOpen.set(false));
  }
}
