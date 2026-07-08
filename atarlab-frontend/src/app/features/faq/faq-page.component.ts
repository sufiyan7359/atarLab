import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ContentApiService } from '../../core/services/content-api.service';
import { FaqItem } from '../../core/models/content.model';

@Component({
  selector: 'app-faq-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container faq-page">
      <h1>Frequently Asked Questions</h1>
      @if (loading()) {
        <p>Loading…</p>
      } @else {
        @for (faq of faqs(); track faq.id) {
          <details>
            <summary>{{ faq.question }}</summary>
            <p>{{ faq.answer }}</p>
          </details>
        }
      }
    </div>
  `,
  styles: [
    `
      .faq-page {
        max-width: 760px;
        margin: 0 auto;
        padding: var(--space-8) 0 var(--space-16);
      }
      details {
        border-bottom: 1px solid var(--border);
        padding: var(--space-4) 0;
      }
      summary {
        cursor: pointer;
        font-weight: 600;
      }
      p {
        margin-top: var(--space-2);
        color: var(--text-secondary);
        line-height: 1.7;
      }
    `,
  ],
})
export class FaqPageComponent implements OnInit {
  private readonly contentApi = inject(ContentApiService);

  faqs = signal<FaqItem[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      const res = await firstValueFrom(this.contentApi.getFaqs());
      this.faqs.set(res.data);
    } finally {
      this.loading.set(false);
    }
  }
}
