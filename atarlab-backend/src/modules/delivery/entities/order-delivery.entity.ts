import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from '../../orders/entities/order.entity';
import { DeliveryAgent } from './delivery-agent.entity';

@Entity('order_deliveries')
export class OrderDelivery extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'agent_id', type: 'uuid', nullable: true })
  agentId: string | null;

  @ManyToOne(() => DeliveryAgent, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'agent_id' })
  agent: DeliveryAgent | null;

  @Column({ name: 'current_lat', type: 'double precision', nullable: true })
  currentLat: number | null;

  @Column({ name: 'current_lng', type: 'double precision', nullable: true })
  currentLng: number | null;

  @Column({ name: 'destination_lat', type: 'double precision', nullable: true })
  destinationLat: number | null;

  @Column({ name: 'destination_lng', type: 'double precision', nullable: true })
  destinationLng: number | null;

  @Column({ name: 'eta_minutes', type: 'int', nullable: true })
  etaMinutes: number | null;

  @Column({ name: 'assigned_at', type: 'timestamptz', nullable: true })
  assignedAt: Date | null;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;
}
