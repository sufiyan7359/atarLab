import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type CookieConsentChoice = 'accepted' | 'declined';
const STORAGE_KEY = 'atarlab_cookie_consent';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _choice = signal<CookieConsentChoice | null>(this.readStored());
  readonly choice = this._choice.asReadonly();

  private readonly _bannerVisible = signal(this.isBrowser && this._choice() === null);
  readonly bannerVisible = this._bannerVisible.asReadonly();

  private readStored(): CookieConsentChoice | null {
    if (!this.isBrowser) return null;
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'accepted' || value === 'declined' ? value : null;
  }

  accept(): void {
    this.setChoice('accepted');
  }

  decline(): void {
    this.setChoice('declined');
  }

  /** Re-opens the banner so a visitor can change their mind — linked from the footer. */
  openPreferences(): void {
    this._bannerVisible.set(true);
  }

  private setChoice(choice: CookieConsentChoice): void {
    this._choice.set(choice);
    this._bannerVisible.set(false);
    if (this.isBrowser) localStorage.setItem(STORAGE_KEY, choice);
  }
}
