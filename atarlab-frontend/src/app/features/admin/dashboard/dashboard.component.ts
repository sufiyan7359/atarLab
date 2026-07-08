import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminDashboardApiService } from '../../../core/services/admin/admin-dashboard-api.service';
import { DashboardSummary, RevenuePoint, TopProductRow } from '../../../core/models/admin.model';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { RevenueChartComponent } from './revenue-chart.component';

type Range = 'week' | 'month' | 'year';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [InrCurrencyPipe, RevenueChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: '../admin-shared.scss',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardApi = inject(AdminDashboardApiService);

  summary = signal<DashboardSummary | null>(null);
  revenue = signal<RevenuePoint[]>([]);
  topProducts = signal<TopProductRow[]>([]);
  range = signal<Range>('month');
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.loadAll();
  }

  async setRange(range: Range): Promise<void> {
    this.range.set(range);
    const res = await firstValueFrom(this.dashboardApi.getRevenue(range));
    this.revenue.set(res.data);
  }

  private async loadAll(): Promise<void> {
    this.loading.set(true);
    try {
      const [summaryRes, revenueRes, topProductsRes] = await Promise.all([
        firstValueFrom(this.dashboardApi.getSummary()),
        firstValueFrom(this.dashboardApi.getRevenue(this.range())),
        firstValueFrom(this.dashboardApi.getTopProducts()),
      ]);
      this.summary.set(summaryRes.data);
      this.revenue.set(revenueRes.data);
      this.topProducts.set(topProductsRes.data);
    } finally {
      this.loading.set(false);
    }
  }
}
