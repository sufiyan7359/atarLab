import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CookieConsentService } from '../../services/cookie-consent.service';

@Component({
  selector: 'app-cookie-consent-banner',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (consent.bannerVisible()) {
      <div class="cookie-banner" role="dialog" aria-label="Cookie preferences">
        <p>
          We use a strictly-necessary cookie to keep you signed in. We don't use analytics
          or advertising cookies today — see our
          <a routerLink="/cookie-policy">Cookie Policy</a> for details.
        </p>
        <div class="actions">
          <button type="button" class="btn btn-ghost" (click)="consent.decline()">Decline optional</button>
          <button type="button" class="btn btn-primary" (click)="consent.accept()">Accept</button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .cookie-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 500;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
        padding: var(--space-4) var(--space-6);
        background: var(--bg-elevated);
        border-top: 1px solid var(--border);
        box-shadow: var(--shadow-lg);
      }
      .cookie-banner p {
        margin: 0;
        flex: 1;
        min-width: 240px;
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
      .cookie-banner a {
        color: var(--accent-strong);
        font-weight: 600;
      }
      .actions {
        display: flex;
        gap: var(--space-2);
        flex-shrink: 0;
      }
    `,
  ],
})
export class CookieConsentBannerComponent {
  consent = inject(CookieConsentService);
}
