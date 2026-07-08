import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ContentApiService } from '../../../core/services/content-api.service';
import { CookieConsentService } from '../../services/cookie-consent.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="site-footer">
      <div class="container grid">
        <div>
          <p class="brand">AtarLab</p>
          <p class="tagline">Pure attars, oud, and eau de parfum — crafted for a signature scent that lasts.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <a routerLink="/shop">All Fragrances</a>
          <a routerLink="/shop" [queryParams]="{ category: 'oud-collection' }">Oud Collection</a>
          <a routerLink="/shop" [queryParams]="{ category: 'pure-attars' }">Pure Attars</a>
        </div>
        <div>
          <h4>Support</h4>
          <a routerLink="/faq">FAQ</a>
          <a routerLink="/contact">Contact Us</a>
          <a routerLink="/account/orders">Track Order</a>
        </div>
        <div>
          <h4>Legal</h4>
          <a routerLink="/privacy-policy">Privacy Policy</a>
          <a routerLink="/terms">Terms of Service</a>
          <a routerLink="/refund-policy">Refund Policy</a>
          <button type="button" class="link-btn" (click)="cookieConsent.openPreferences()">Cookie Preferences</button>
        </div>
        <div>
          <h4>Newsletter</h4>
          <p class="tagline">Get early access to new drops and offers.</p>
          <form class="newsletter" (submit)="subscribe($event)">
            <input type="email" placeholder="you@example.com" [(ngModel)]="email" name="email" required />
            <button type="submit" [disabled]="subscribing()">{{ subscribing() ? '…' : 'Join' }}</button>
          </form>
        </div>
      </div>
      <div class="container bottom">© {{ year }} AtarLab. All rights reserved.</div>
    </footer>
  `,
  styles: [
    `
      .site-footer {
        background: var(--bg-muted);
        border-top: 1px solid var(--border);
        margin-top: var(--space-16);
        padding: var(--space-12) 0 var(--space-6);
      }
      .grid {
        display: grid;
        gap: var(--space-8);
        grid-template-columns: 1fr;
        @media (min-width: 700px) {
          grid-template-columns: repeat(3, 1fr);
        }
        @media (min-width: 1024px) {
          grid-template-columns: 1.6fr 1fr 1fr 1fr 1.4fr;
        }
      }
      .brand {
        font-family: var(--font-display);
        font-size: 1.3rem;
        font-weight: 700;
        color: var(--accent-strong);
        margin-bottom: var(--space-2);
      }
      .tagline {
        font-size: 0.88rem;
        max-width: 320px;
      }
      h4 {
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: var(--space-3);
      }
      a,
      .link-btn {
        display: block;
        color: var(--text-secondary);
        margin-bottom: var(--space-2);
        font-size: 0.9rem;
      }
      .link-btn {
        border: none;
        background: none;
        padding: 0;
        cursor: pointer;
        text-align: left;
        font-family: inherit;
      }
      a:hover,
      .link-btn:hover {
        color: var(--accent-strong);
      }
      .newsletter {
        display: flex;
        gap: 8px;
      }
      .newsletter input {
        flex: 1;
        padding: 8px 12px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border);
        background: var(--bg-elevated);
        color: var(--text-primary);
      }
      .newsletter button {
        padding: 8px 16px;
        border-radius: var(--radius-sm);
        border: none;
        background: var(--accent);
        color: var(--text-on-accent);
        font-weight: 600;
        cursor: pointer;
      }
      .bottom {
        margin-top: var(--space-8);
        padding-top: var(--space-4);
        border-top: 1px solid var(--border);
        font-size: 0.8rem;
        color: var(--text-secondary);
      }
    `,
  ],
})
export class FooterComponent {
  private readonly contentApi = inject(ContentApiService);
  private readonly toast = inject(ToastService);
  cookieConsent = inject(CookieConsentService);

  year = new Date().getFullYear();
  email = '';
  subscribing = signal(false);

  async subscribe(event: Event): Promise<void> {
    event.preventDefault();
    const value = this.email.trim();
    if (!value) return;
    this.subscribing.set(true);
    try {
      await firstValueFrom(this.contentApi.subscribeNewsletter(value));
      this.toast.success("You're subscribed!");
      this.email = '';
    } catch {
      this.toast.error('Could not subscribe — check the email and try again.');
    } finally {
      this.subscribing.set(false);
    }
  }
}
