import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('addresses')
export class Address extends BaseEntity {
  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 30, default: 'Home' })
  label: string;

  @Column({ type: 'varchar', length: 150 })
  fullName: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  line1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  line2: string | null;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 12 })
  postalCode: string;

  @Column({ type: 'varchar', length: 2, default: 'IN' })
  country: string;

  @Column({ type: 'numeric', precision: 9, scale: 6, nullable: true })
  lat: number | null;

  @Column({ type: 'numeric', precision: 9, scale: 6, nullable: true })
  lng: number | null;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;
}
