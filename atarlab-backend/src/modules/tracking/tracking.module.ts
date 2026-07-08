import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { TrackingGateway } from './tracking.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), JwtModule.register({})],
  providers: [TrackingGateway],
  exports: [TrackingGateway],
})
export class TrackingModule {}
