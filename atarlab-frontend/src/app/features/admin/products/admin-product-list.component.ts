import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AdminProductsApiService } from '../../../core/services/admin/admin-products-api.service';
import { Product } from '../../../core/models/product.model';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [RouterLink, InrCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-product-list.component.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminProductListComponent implements OnInit {
  private readonly api = inject(AdminProductsApiService);
  private readonly toast = inject(ToastService);

  products = signal<Product[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.list({ limit: 100 }));
      this.products.set(res.data);
    } finally {
      this.loading.set(false);
    }
  }

  async remove(id: string): Promise<void> {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await firstValueFrom(this.api.remove(id));
    this.toast.success('Product deleted');
    await this.load();
  }
}
