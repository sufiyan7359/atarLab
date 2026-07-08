import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="stars" [attr.aria-label]="rating() + ' out of 5 stars'">
      @for (i of [0, 1, 2, 3, 4]; track i) {
        <span class="star" [class.filled]="i < roundedRating()">★</span>
      }
    </span>
    @if (showCount()) {
      <span class="count">({{ count() }})</span>
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .stars {
        display: inline-flex;
        letter-spacing: 1px;
      }
      .star {
        color: var(--border);
        font-size: 0.95rem;
      }
      .star.filled {
        color: var(--accent);
      }
      .count {
        font-size: 0.8rem;
        color: var(--text-secondary);
      }
    `,
  ],
})
export class RatingStarsComponent {
  rating = input<number | string>(0);
  count = input<number | string>(0);
  showCount = input(true);
  roundedRating = computed(() => Math.round(Number(this.rating())));
}
