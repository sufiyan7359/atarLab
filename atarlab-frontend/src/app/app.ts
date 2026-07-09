import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HeaderComponent } from './shared/layout/header/header.component';
import { FooterComponent } from './shared/layout/footer/footer.component';
import { MobileNavComponent } from './shared/layout/mobile-nav/mobile-nav.component';
import { ToastHostComponent } from './shared/components/toast-host/toast-host.component';
import { CookieConsentBannerComponent } from './shared/components/cookie-consent/cookie-consent-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MobileNavComponent,
    ToastHostComponent,
    CookieConsentBannerComponent,
  ],
  template: `
    <!-- The admin console is a separate ops-tool shell (its own header/sidebar/nav) —
         the storefront chrome around it would just be dead weight, and on mobile the
         storefront's bottom nav bar would visually collide with the admin sidebar. -->
    @if (!isAdminRoute()) {
      <app-header />
    }
    <main class="page-shell" [class.admin-shell-page]="isAdminRoute()">
      <router-outlet />
    </main>
    @if (!isAdminRoute()) {
      <app-footer />
      <app-mobile-nav />
    }
    <app-toast-host />
    @if (!isAdminRoute()) {
      <app-cookie-consent-banner />
    }
  `,
  styles: [
    `
      .page-shell {
        min-height: 60vh;
        padding-bottom: 72px;
      }
      @media (min-width: 900px) {
        .page-shell {
          padding-bottom: 0;
        }
      }
      .page-shell.admin-shell-page {
        min-height: 0;
        padding-bottom: 0;
      }
    `,
  ],
})
export class App {
  private readonly router = inject(Router);

  private readonly currentUrl = signal(this.router.url);
  isAdminRoute = computed(() => this.currentUrl().startsWith('/admin'));

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));
  }
}
