import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AdminOrdersApiService } from '../../../core/services/admin/admin-orders-api.service';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { ToastService } from '../../../shared/services/toast.service';

const STATUS_OPTIONS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PACKED',
  'PICKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
];

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, InrCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-order-detail.component.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminOrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(AdminOrdersApiService);
  private readonly toast = inject(ToastService);

  order = signal<Order | null>(null);
  loading = signal(true);
  updating = signal(false);
  statusOptions = STATUS_OPTIONS;
  selectedStatus: OrderStatus = 'PENDING';
  statusNote = '';

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    await this.load(id);
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.getById(id));
      this.order.set(res.data);
      this.selectedStatus = res.data.status;
    } finally {
      this.loading.set(false);
    }
  }

  async updateStatus(): Promise<void> {
    const order = this.order();
    if (!order) return;
    this.updating.set(true);
    try {
      await firstValueFrom(this.api.updateStatus(order.id, this.selectedStatus, this.statusNote || undefined));
      this.toast.success('Order status updated');
      this.statusNote = '';
      await this.load(order.id);
    } finally {
      this.updating.set(false);
    }
  }

  async refund(): Promise<void> {
    const order = this.order();
    if (!order) return;
    if (!confirm('Cancel this order and refund the customer?')) return;
    this.updating.set(true);
    try {
      await firstValueFrom(this.api.refund(order.id, 'Refunded by admin'));
      this.toast.success('Order refunded and cancelled');
      await this.load(order.id);
    } finally {
      this.updating.set(false);
    }
  }
}
