import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AdminOrdersApiService } from '../../../core/services/admin/admin-orders-api.service';
import { AdminDeliveryAgentsApiService } from '../../../core/services/admin/admin-delivery-agents-api.service';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { DeliveryAgent, OrderDelivery } from '../../../core/models/tracking.model';
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
  private readonly deliveryApi = inject(AdminDeliveryAgentsApiService);
  private readonly toast = inject(ToastService);

  order = signal<Order | null>(null);
  loading = signal(true);
  updating = signal(false);
  statusOptions = STATUS_OPTIONS;
  selectedStatus: OrderStatus = 'PENDING';
  statusNote = '';

  deliveryAgents = signal<DeliveryAgent[]>([]);
  delivery = signal<OrderDelivery | null>(null);
  selectedAgentId = '';
  assigningAgent = signal(false);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    await this.load(id);
    const agentsRes = await firstValueFrom(this.deliveryApi.list());
    this.deliveryAgents.set(agentsRes.data.filter((a) => a.isActive));
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const [orderRes, deliveryRes] = await Promise.all([
        firstValueFrom(this.api.getById(id)),
        firstValueFrom(this.deliveryApi.getForOrder(id)),
      ]);
      this.order.set(orderRes.data);
      this.selectedStatus = orderRes.data.status;
      this.delivery.set(deliveryRes.data);
      this.selectedAgentId = deliveryRes.data?.agentId ?? '';
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

  async assignAgent(): Promise<void> {
    const order = this.order();
    if (!order || !this.selectedAgentId) return;
    this.assigningAgent.set(true);
    try {
      await firstValueFrom(this.deliveryApi.assign(order.id, this.selectedAgentId));
      this.toast.success('Delivery agent assigned');
      await this.load(order.id);
    } finally {
      this.assigningAgent.set(false);
    }
  }
}
