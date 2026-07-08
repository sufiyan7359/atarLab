import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { SettingsService } from './settings.service';
import { AdminSettingsController } from './admin-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  controllers: [AdminSettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
