import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const THEME_KEY = 'atarlab_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _isDark = signal(this.readInitial());

  readonly isDark = this._isDark.asReadonly();

  constructor() {
    this.apply(this._isDark());
  }

  toggle(): void {
    const next = !this._isDark();
    this._isDark.set(next);
    this.apply(next);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    }
  }

  private readInitial(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  private apply(isDark: boolean): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }
}
