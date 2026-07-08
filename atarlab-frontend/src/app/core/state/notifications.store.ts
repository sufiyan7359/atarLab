import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NotificationsApiService } from '../services/notifications-api.service';
import { TrackingSocketService } from '../services/tracking-socket.service';
import { AppNotification } from '../models/tracking.model';

@Injectable({ providedIn: 'root' })
export class NotificationsStore {
  private readonly api = inject(NotificationsApiService);
  private readonly trackingSocket = inject(TrackingSocketService);

  private readonly _notifications = signal<AppNotification[]>([]);
  private readonly _unreadCount = signal(0);
  private listening = false;

  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();

  async refresh(): Promise<void> {
    try {
      const [listRes, countRes] = await Promise.all([
        firstValueFrom(this.api.list()),
        firstValueFrom(this.api.unreadCount()),
      ]);
      this._notifications.set(listRes.data);
      this._unreadCount.set(countRes.data.count);
    } catch {
      this._notifications.set([]);
      this._unreadCount.set(0);
    }
    this.startListening();
  }

  private startListening(): void {
    if (this.listening) return;
    this.listening = true;
    this.trackingSocket.onNotification().subscribe((notification) => {
      this._notifications.update((list) => [notification, ...list].slice(0, 20));
      this._unreadCount.update((count) => count + 1);
    });
  }

  async markRead(id: string): Promise<void> {
    const wasUnread = this._notifications().find((n) => n.id === id && !n.isRead);
    this._notifications.update((list) => list.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    if (wasUnread) this._unreadCount.update((count) => Math.max(0, count - 1));
    await firstValueFrom(this.api.markRead(id));
  }

  async markAllRead(): Promise<void> {
    this._notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
    this._unreadCount.set(0);
    await firstValueFrom(this.api.markAllRead());
  }

  clear(): void {
    this._notifications.set([]);
    this._unreadCount.set(0);
  }
}
