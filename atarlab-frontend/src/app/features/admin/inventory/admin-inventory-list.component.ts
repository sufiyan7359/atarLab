import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminInventoryApiService } from '../../../core/services/admin/admin-inventory-api.service';
import { InventoryRow } from '../../../core/models/admin.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-inventory-list',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-inventory-list.component.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminInventoryListComponent implements OnInit {
  private readonly api = inject(AdminInventoryApiService);
  private readonly toast = inject(ToastService);

  rows = signal<InventoryRow[]>([]);
  lowStockOnly = signal(false);
  loading = signal(true);
  adjustments: Record<string, number> = {};

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async toggleLowStock(): Promise<void> {
    this.lowStockOnly.set(!this.lowStockOnly());
    await this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.list(1, this.lowStockOnly()));
      this.rows.set(res.data);
    } finally {
      this.loading.set(false);
    }
  }

  async adjust(variantId: string, direction: 1 | -1): Promise<void> {
    const amount = this.adjustments[variantId] || 1;
    await firstValueFrom(this.api.adjust(variantId, amount * direction));
    this.toast.success('Stock adjusted');
    await this.load();
  }
}
