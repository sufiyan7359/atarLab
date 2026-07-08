import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const SESSION_KEY = 'atarlab_guest_session_id';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly platformId = inject(PLATFORM_ID);
  private cachedId: string | null = null;

  getSessionId(): string {
    if (this.cachedId) return this.cachedId;
    if (!isPlatformBrowser(this.platformId)) return 'ssr-session';

    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    this.cachedId = id;
    return id;
  }

  clear(): void {
    this.cachedId = null;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(SESSION_KEY);
    }
  }
}
