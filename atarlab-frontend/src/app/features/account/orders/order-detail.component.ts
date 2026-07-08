import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OrdersApiService } from '../../../core/services/orders-api.service';
import { TrackingSocketService } from '../../../core/services/tracking-socket.service';
import { Order } from '../../../core/models/order.model';
import { OrderDelivery } from '../../../core/models/tracking.model';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { downloadBlob } from '../../../shared/utils/download-blob.util';
import { TrackingMapComponent } from '../../../shared/components/tracking-map/tracking-map.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, InrCurrencyPipe, DatePipe, TrackingMapComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-detail.component.html',
  styleUrl: './account-shared.scss',
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ordersApi = inject(OrdersApiService);
  private readonly toast = inject(ToastService);
  private readonly trackingSocket = inject(TrackingSocketService);
  private readonly destroyRef = inject(DestroyRef);

  order = signal<Order | null>(null);
  delivery = signal<OrderDelivery | null>(null);
  loading = signal(true);
  cancelling = signal(false);

  readonly statusSteps = ['CONFIRMED', 'PACKED', 'PICKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    await this.load(id);
    this.watchLive(id);
    this.destroyRef.onDestroy(() => this.trackingSocket.leaveOrder(id));
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const [orderRes, trackingRes] = await Promise.all([
        firstValueFrom(this.ordersApi.getById(id)),
        firstValueFrom(this.ordersApi.getTracking(id)),
      ]);
      this.order.set(orderRes.data);
      this.delivery.set(trackingRes.data.delivery);
    } finally {
      this.loading.set(false);
    }
  }

  private watchLive(id: string): void {
    this.trackingSocket.joinOrder(id);

    this.trackingSocket
      .onOrderUpdate()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.order.update((current) => (current ? { ...current, status: event.status } : current));
      });

    this.trackingSocket
      .onDeliveryPosition()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.delivery.update((current) =>
          current ? { ...current, currentLat: event.lat, currentLng: event.lng, etaMinutes: event.etaMinutes } : current,
        );
      });
  }

  downloadingInvoice = signal(false);

  async downloadInvoice(): Promise<void> {
    const order = this.order();
    if (!order) return;
    this.downloadingInvoice.set(true);
    try {
      const blob = await firstValueFrom(this.ordersApi.downloadInvoice(order.id));
      downloadBlob(blob, `invoice-${order.orderNumber}.pdf`);
    } catch {
      this.toast.error('Could not download invoice right now.');
    } finally {
      this.downloadingInvoice.set(false);
    }
  }

  async cancelOrder(): Promise<void> {
    const order = this.order();
    if (!order) return;
    this.cancelling.set(true);
    try {
      await firstValueFrom(this.ordersApi.cancel(order.id));
      this.toast.success('Order cancelled');
      await this.load(order.id);
    } catch {
      this.toast.error('This order can no longer be cancelled');
    } finally {
      this.cancelling.set(false);
    }
  }

  canCancel(): boolean {
    const status = this.order()?.status;
    return status === 'PENDING' || status === 'CONFIRMED';
  }
}
