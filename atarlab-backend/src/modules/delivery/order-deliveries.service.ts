import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDelivery } from './entities/order-delivery.entity';

// Fixed demo dispatch point (Mumbai) — there's no real warehouse network or address
// geocoding in this sandbox, so every delivery simulates starting from here.
const WAREHOUSE = { lat: 19.076, lng: 72.8777 };

@Injectable()
export class OrderDeliveriesService {
  constructor(
    @InjectRepository(OrderDelivery)
    private readonly repo: Repository<OrderDelivery>,
  ) {}

  getByOrderId(orderId: string): Promise<OrderDelivery | null> {
    return this.repo.findOne({
      where: { orderId },
      relations: { agent: true },
    });
  }

  async requireByOrderId(orderId: string): Promise<OrderDelivery> {
    const delivery = await this.getByOrderId(orderId);
    if (!delivery)
      throw new NotFoundException('No delivery assigned for this order yet');
    return delivery;
  }

  async assignAgent(
    orderId: string,
    agentId: string,
    etaMinutes?: number,
  ): Promise<OrderDelivery> {
    let delivery = await this.repo.findOne({ where: { orderId } });
    const destination = this.deriveDestination(orderId);
    if (!delivery) {
      delivery = this.repo.create({ orderId });
    }
    delivery.agentId = agentId;
    delivery.currentLat = WAREHOUSE.lat;
    delivery.currentLng = WAREHOUSE.lng;
    delivery.destinationLat = destination.lat;
    delivery.destinationLng = destination.lng;
    delivery.etaMinutes = etaMinutes ?? 30;
    delivery.assignedAt = new Date();
    delivery.deliveredAt = null;
    const saved = await this.repo.save(delivery);
    const withAgent = await this.repo.findOne({
      where: { id: saved.id },
      relations: { agent: true },
    });
    return withAgent!;
  }

  async updatePosition(
    orderId: string,
    lat: number,
    lng: number,
  ): Promise<void> {
    await this.repo.update({ orderId }, { currentLat: lat, currentLng: lng });
  }

  async markDelivered(orderId: string): Promise<void> {
    await this.repo.update({ orderId }, { deliveredAt: new Date() });
  }

  getWarehouse(): { lat: number; lng: number } {
    return WAREHOUSE;
  }

  /** Deterministic per-order jitter around the warehouse (~1-3km) — stands in for
   *  geocoding the shipping address, which this sandbox doesn't have. */
  private deriveDestination(orderId: string): { lat: number; lng: number } {
    let hash = 0;
    for (let i = 0; i < orderId.length; i++) {
      hash = (hash * 31 + orderId.charCodeAt(i)) >>> 0;
    }
    const latJitter = (((hash % 2000) - 1000) / 1000) * 0.025;
    const lngJitter = ((((hash >>> 8) % 2000) - 1000) / 1000) * 0.025;
    return { lat: WAREHOUSE.lat + latJitter, lng: WAREHOUSE.lng + lngJitter };
  }
}
