import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminReviewsApiService } from '../../../core/services/admin/admin-reviews-api.service';
import { Review } from '../../../core/models/product.model';
import { RatingStarsComponent } from '../../../shared/components/rating-stars/rating-stars.component';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-review-moderation',
  standalone: true,
  imports: [RatingStarsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-review-moderation.component.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminReviewModerationComponent implements OnInit {
  private readonly api = inject(AdminReviewsApiService);
  private readonly toast = inject(ToastService);

  reviews = signal<Review[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.listPending());
      this.reviews.set(res.data);
    } finally {
      this.loading.set(false);
    }
  }

  async approve(id: string): Promise<void> {
    await firstValueFrom(this.api.approve(id));
    this.toast.success('Review approved');
    this.reviews.update((list) => list.filter((r) => r.id !== id));
  }

  async reject(id: string): Promise<void> {
    await firstValueFrom(this.api.reject(id));
    this.toast.success('Review rejected');
    this.reviews.update((list) => list.filter((r) => r.id !== id));
  }
}
