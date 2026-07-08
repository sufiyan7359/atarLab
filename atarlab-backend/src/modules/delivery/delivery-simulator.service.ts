import { Injectable, Logger } from '@nestjs/common';
import { OrderDeliveriesService } from './order-deliveries.service';
import { TrackingGateway } from '../tracking/tracking.gateway';

const TICK_MS = 2000;
const TOTAL_TICKS = 30; // ~60s end-to-end, matches the ETA shown on the tracking page

/** Stands in for a real delivery agent's GPS feed: once an order goes OUT_FOR_DELIVERY,
 *  linearly interpolates its assigned delivery from the warehouse to the destination
 *  point and pushes live position updates over the tracking socket. No agent mobile
 *  app exists in this sandbox, so this is what makes the map on the tracking page move. */
@Injectable()
export class DeliverySimulatorService {
  private readonly logger = new Logger(DeliverySimulatorService.name);
  private readonly active = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly orderDeliveriesService: OrderDeliveriesService,
    private readonly trackingGateway: TrackingGateway,
  ) {}

  async start(orderId: string): Promise<void> {
    if (this.active.has(orderId)) return;

    const delivery = await this.orderDeliveriesService.getByOrderId(orderId);
    if (!delivery?.agentId || delivery.destinationLat == null || delivery.destinationLng == null) return;

    const from = { lat: delivery.currentLat!, lng: delivery.currentLng! };
    const to = { lat: delivery.destinationLat, lng: delivery.destinationLng };
    let tick = 0;

    const timer = setInterval(() => {
      tick += 1;
      const t = Math.min(tick / TOTAL_TICKS, 1);
      const lat = from.lat + (to.lat - from.lat) * t;
      const lng = from.lng + (to.lng - from.lng) * t;

      this.orderDeliveriesService.updatePosition(orderId, lat, lng).catch((err) => this.logger.error(err));
      this.trackingGateway.emitDeliveryPosition(orderId, {
        lat,
        lng,
        etaMinutes: Math.max(1, Math.round(delivery.etaMinutes! * (1 - t))),
      });

      if (t >= 1) this.stop(orderId);
    }, TICK_MS);

    this.active.set(orderId, timer);
  }

  stop(orderId: string): void {
    const timer = this.active.get(orderId);
    if (timer) {
      clearInterval(timer);
      this.active.delete(orderId);
    }
  }
}
