import { Injectable, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, fromEvent } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthStore } from '../state/auth.store';
import { OrderUpdateEvent, DeliveryPositionEvent, AppNotification } from '../models/tracking.model';

/** Thin wrapper around one shared Socket.IO connection to the /tracking namespace.
 *  Browser-only: session restoration itself only ever happens client-side (see
 *  auth-flow docs), so there's never a valid access token to hand the gateway
 *  during SSR — connecting there would just fail handshake auth immediately. */
@Injectable({ providedIn: 'root' })
export class TrackingSocketService implements OnDestroy {
  private readonly authStore = inject(AuthStore);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private socket: Socket | null = null;

  private ensureConnected(): Socket | null {
    if (!this.isBrowser) return null;
    if (this.socket) return this.socket;
    const origin = environment.apiUrl.replace(/\/api\/v1\/?$/, '');
    this.socket = io(`${origin}/tracking`, {
      auth: { token: this.authStore.accessToken() },
      transports: ['websocket'],
    });
    return this.socket;
  }

  joinOrder(orderId: string): void {
    this.ensureConnected()?.emit('join:order', { orderId });
  }

  leaveOrder(orderId: string): void {
    this.socket?.emit('leave:order', { orderId });
  }

  onOrderUpdate(): Observable<OrderUpdateEvent> {
    const socket = this.ensureConnected();
    return socket ? fromEvent<OrderUpdateEvent>(socket, 'order:update') : new Observable();
  }

  onDeliveryPosition(): Observable<DeliveryPositionEvent> {
    const socket = this.ensureConnected();
    return socket ? fromEvent<DeliveryPositionEvent>(socket, 'delivery:position') : new Observable();
  }

  onNotification(): Observable<AppNotification> {
    const socket = this.ensureConnected();
    return socket ? fromEvent<AppNotification>(socket, 'notification:new') : new Observable();
  }

  ngOnDestroy(): void {
    this.socket?.disconnect();
  }
}
