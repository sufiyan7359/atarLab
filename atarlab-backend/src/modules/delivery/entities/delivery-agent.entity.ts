import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('delivery_agents')
export class DeliveryAgent extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({
    name: 'vehicle_number',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  vehicleNumber: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
