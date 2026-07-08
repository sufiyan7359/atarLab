import { Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { RoleName } from '../../common/enums';
import { AppConfig } from '../../config/configuration';
import { JwtPayload } from '../../common/interfaces/auth.interface';

interface AuthedSocket extends Socket {
  data: { userId: string; roles: string[] };
}

const STAFF_ROLES: string[] = [
  RoleName.SUPER_ADMIN,
  RoleName.ADMIN,
  RoleName.STAFF,
];

/** Room-per-order live tracking + a personal room per user for notification pushes.
 *  JWT is passed via the Socket.IO handshake (`auth.token`), not a cookie — this
 *  namespace is a plain WS connection with no CSRF surface to worry about. */
@WebSocketGateway({
  namespace: '/tracking',
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
    credentials: true,
  },
})
export class TrackingGateway implements OnGatewayConnection {
  private readonly logger = new Logger(TrackingGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
  ) {}

  handleConnection(client: AuthedSocket): void {
    try {
      const token = client.handshake.auth?.['token'] as string | undefined;
      if (!token) throw new UnauthorizedException();
      const app = this.configService.get<AppConfig>('app')!;
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: app.jwt.accessSecret,
      });
      client.data.userId = payload.sub;
      client.data.roles = payload.roles ?? [];
      void client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('join:order')
  async joinOrder(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { orderId: string },
  ): Promise<void> {
    const order = await this.orderRepo.findOne({ where: { id: body.orderId } });
    if (!order) return;
    const isOwner = order.userId === client.data.userId;
    const isStaff = client.data.roles.some((r) => STAFF_ROLES.includes(r));
    if (!isOwner && !isStaff) return;
    void client.join(`order:${body.orderId}`);
  }

  @SubscribeMessage('leave:order')
  leaveOrder(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { orderId: string },
  ): void {
    void client.leave(`order:${body.orderId}`);
  }

  emitOrderUpdate(orderId: string, payload: unknown): void {
    this.server.to(`order:${orderId}`).emit('order:update', payload);
  }

  emitDeliveryPosition(orderId: string, payload: unknown): void {
    this.server.to(`order:${orderId}`).emit('delivery:position', payload);
  }

  emitNotification(userId: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit('notification:new', payload);
  }
}
