import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryAgent } from './entities/delivery-agent.entity';
import { OrderDelivery } from './entities/order-delivery.entity';
import { DeliveryAgentsService } from './delivery-agents.service';
import { OrderDeliveriesService } from './order-deliveries.service';
import { AdminDeliveryAgentsController } from './admin-delivery-agents.controller';
import { AdminOrderDeliveriesController } from './admin-order-deliveries.controller';
import { TrackingModule } from '../tracking/tracking.module';
import { DeliverySimulatorService } from './delivery-simulator.service';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryAgent, OrderDelivery]), TrackingModule],
  controllers: [AdminDeliveryAgentsController, AdminOrderDeliveriesController],
  providers: [DeliveryAgentsService, OrderDeliveriesService, DeliverySimulatorService],
  exports: [DeliveryAgentsService, OrderDeliveriesService, DeliverySimulatorService],
})
export class DeliveryModule {}
