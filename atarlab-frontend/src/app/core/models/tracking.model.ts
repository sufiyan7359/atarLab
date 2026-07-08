import { OrderStatus } from './order.model';

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string | null;
  isActive: boolean;
}

export interface OrderDelivery {
  id: string;
  orderId: string;
  agentId: string | null;
  agent: DeliveryAgent | null;
  currentLat: number | null;
  currentLng: number | null;
  destinationLat: number | null;
  destinationLng: number | null;
  etaMinutes: number | null;
  assignedAt: string | null;
  deliveredAt: string | null;
}

export interface OrderUpdateEvent {
  status: OrderStatus;
  note: string | null;
  updatedAt: string;
}

export interface DeliveryPositionEvent {
  lat: number;
  lng: number;
  etaMinutes: number;
}

export type NotificationType = 'ORDER_STATUS';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  orderId: string | null;
  isRead: boolean;
  createdAt: string;
}
