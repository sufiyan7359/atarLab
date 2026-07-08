import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../state/auth.store';
import { AuthRefreshCoordinator } from './auth-refresh-coordinator.service';
import { CartStore } from '../state/cart.store';
import { NotificationsStore } from '../state/notifications.store';

/**
 * Restores the session (via the refresh-token cookie) before the app becomes interactive.
 * Wired through `provideAppInitializer` so the router's initial navigation — and therefore
 * every route guard — always sees a resolved auth state instead of racing this call.
 *
 * Browser-only by design: refresh tokens rotate on every use, and the resulting Set-Cookie
 * from a server-side call never reaches the real browser cookie jar (it lands on the SSR
 * server's internal fetch response, not the outer page response). Calling it from both SSR
 * and the client would race two rotations against the same cookie and get the loser treated
 * as token reuse, revoking the whole session. So public pages render logged-out on the
 * server (personalization kicks in after hydration); authenticated-only routes are marked
 * `RenderMode.Client` in app.routes.server.ts so their guards never evaluate server-side.
 */
@Injectable({ providedIn: 'root' })
export class AuthBootstrapService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authStore = inject(AuthStore);
  private readonly refreshCoordinator = inject(AuthRefreshCoordinator);
  private readonly cartStore = inject(CartStore);
  private readonly notificationsStore = inject(NotificationsStore);

  async initialize(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      this.authStore.markInitialized();
      return;
    }

    try {
      const res = await firstValueFrom(this.refreshCoordinator.refresh());
      this.authStore.setSession(res.data.accessToken, res.data.user);
      void this.notificationsStore.refresh();
    } catch {
      this.authStore.clear();
    }
    void this.cartStore.refresh();
  }
}
