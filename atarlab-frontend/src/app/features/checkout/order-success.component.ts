import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OrdersApiService } from '../../core/services/orders-api.service';
import { Order } from '../../core/models/order.model';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [RouterLink, InrCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container success-page">
      @if (order(); as o) {
        <div class="card-surface success-card">
          <div class="checkmark">✓</div>
          <h1>Order Confirmed!</h1>
          <p>Thank you — your order <strong>{{ o.orderNumber }}</strong> has been placed successfully.</p>
          <p class="total">Total: {{ o.grandTotal | inr }}</p>
          <div class="actions">
            <a [routerLink]="['/account/orders', o.id]" class="btn btn-primary">Track Order</a>
            <a routerLink="/shop" class="btn btn-ghost">Continue Shopping</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .success-page {
        padding: var(--space-16) var(--space-4);
        display: flex;
        justify-content: center;
      }
      .success-card {
        max-width: 480px;
        text-align: center;
      }
      .checkmark {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--success);
        color: #fff;
        font-size: 1.6rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto var(--space-4);
      }
      .total {
        font-weight: 700;
        font-size: 1.2rem;
        margin: var(--space-4) 0;
      }
      .actions {
        display: flex;
        gap: var(--space-3);
        justify-content: center;
        flex-wrap: wrap;
      }
    `,
  ],
})
export class OrderSuccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ordersApi = inject(OrdersApiService);

  order = signal<Order | null>(null);

  async ngOnInit(): Promise<void> {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (!orderId) return;
    const res = await firstValueFrom(this.ordersApi.getById(orderId));
    this.order.set(res.data);
  }
}
