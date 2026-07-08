import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminCustomersController } from './admin-customers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, AdminCustomersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
