import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AdminOrdersApiService } from '../../../core/services/admin/admin-orders-api.service';
import { Order } from '../../../core/models/order.model';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-admin-order-list',
  standalone: true,
  imports: [RouterLink, DatePipe, InrCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-order-list.component.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminOrderListComponent implements OnInit {
  private readonly api = inject(AdminOrdersApiService);
  orders = signal<Order[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.list());
      this.orders.set(res.data);
    } finally {
      this.loading.set(false);
    }
  }
}
