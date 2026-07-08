import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
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
          <h4>Newsletter</h4>
          <p class="tagline">Get early access to new drops and offers.</p>
          <form class="newsletter">
            <input type="email" placeholder="you@example.com" />
            <button type="submit">Join</button>
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
          grid-template-columns: 2fr 1fr 1fr 1.4fr;
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
      a {
        display: block;
        color: var(--text-secondary);
        margin-bottom: var(--space-2);
        font-size: 0.9rem;
      }
      a:hover {
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
  year = new Date().getFullYear();
}
