import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminDashboardApiService } from '../../../core/services/admin/admin-dashboard-api.service';
import { AdminReportsApiService } from '../../../core/services/admin/admin-reports-api.service';
import { TopCustomerRow, TopProductRow } from '../../../core/models/admin.model';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { downloadBlob } from '../../../shared/utils/download-blob.util';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [InrCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-reports.component.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminReportsComponent implements OnInit {
  private readonly dashboardApi = inject(AdminDashboardApiService);
  private readonly reportsApi = inject(AdminReportsApiService);

  topProducts = signal<TopProductRow[]>([]);
  topCustomers = signal<TopCustomerRow[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      const [productsRes, customersRes] = await Promise.all([
        firstValueFrom(this.dashboardApi.getTopProducts()),
        firstValueFrom(this.dashboardApi.getTopCustomers()),
      ]);
      this.topProducts.set(productsRes.data);
      this.topCustomers.set(customersRes.data);
    } finally {
      this.loading.set(false);
    }
  }

  async exportTopProducts(): Promise<void> {
    const blob = await firstValueFrom(this.reportsApi.exportTopProductsCsv());
    downloadBlob(blob, 'top-products.csv');
  }

  async exportTopCustomers(): Promise<void> {
    const blob = await firstValueFrom(this.reportsApi.exportTopCustomersCsv());
    downloadBlob(blob, 'top-customers.csv');
  }
}
