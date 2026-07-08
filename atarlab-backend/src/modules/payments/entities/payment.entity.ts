import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { PaymentProvider, PaymentTxnStatus } from '../../../common/enums';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'varchar', length: 20 })
  provider: PaymentProvider;

  @Column({
    name: 'provider_order_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  providerOrderId: string | null;

  @Column({
    name: 'provider_payment_id',
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
  })
  providerPaymentId: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'INR' })
  currency: string;

  @Column({ type: 'varchar', length: 20, default: PaymentTxnStatus.CREATED })
  status: PaymentTxnStatus;

  @Column({ name: 'raw_response', type: 'jsonb', nullable: true })
  rawResponse: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
