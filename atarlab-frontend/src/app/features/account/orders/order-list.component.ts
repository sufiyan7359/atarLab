import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OrdersApiService } from '../../../core/services/orders-api.service';
import { Order } from '../../../core/models/order.model';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [RouterLink, InrCurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-list.component.html',
  styleUrl: './account-shared.scss',
})
export class OrderListComponent implements OnInit {
  private readonly ordersApi = inject(OrdersApiService);
  orders = signal<Order[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      const res = await firstValueFrom(this.ordersApi.list());
      this.orders.set(res.data);
    } finally {
      this.loading.set(false);
    }
  }
}
