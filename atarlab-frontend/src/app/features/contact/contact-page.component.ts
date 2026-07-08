import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container contact-page">
      <h1>Contact Us</h1>
      <p>We're happy to help with orders, returns, or anything fragrance-related.</p>
      <dl>
        <dt>Email</dt>
        <dd><a href="mailto:support&#64;atarlab.com">support&#64;atarlab.com</a></dd>
        <dt>Hours</dt>
        <dd>Monday–Saturday, 10am–7pm IST</dd>
      </dl>
      <p class="note">
        For an existing order, include your order number so we can help faster.
      </p>
    </div>
  `,
  styles: [
    `
      .contact-page {
        max-width: 560px;
        margin: 0 auto;
        padding: var(--space-8) 0 var(--space-16);
      }
      dl {
        margin: var(--space-6) 0;
      }
      dt {
        font-weight: 700;
        margin-top: var(--space-4);
      }
      dd {
        margin: 0;
        color: var(--text-secondary);
      }
      .note {
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
    `,
  ],
})
export class ContactPageComponent {}
