import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Health')
@Public()
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('db')
  async checkDb() {
    const isConnected = this.dataSource.isInitialized;
    if (isConnected) {
      await this.dataSource.query('SELECT 1');
    }
    return { status: isConnected ? 'ok' : 'down' };
  }
}
