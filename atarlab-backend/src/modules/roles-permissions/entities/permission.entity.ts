import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string; // e.g. 'products.create'

  @Column({ type: 'varchar', length: 50 })
  module: string; // e.g. 'products'
}
