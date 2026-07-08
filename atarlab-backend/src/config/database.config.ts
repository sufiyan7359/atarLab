import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfig } from './configuration';

export const buildTypeOrmOptions = (configService: ConfigService): TypeOrmModuleOptions => {
  const app = configService.get<AppConfig>('app')!;
  return {
    type: 'postgres',
    host: app.database.host,
    port: app.database.port,
    username: app.database.username,
    password: app.database.password,
    database: app.database.name,
    ssl: app.database.ssl ? { rejectUnauthorized: false } : false,
    autoLoadEntities: true,
    synchronize: false,
    logging: app.env === 'local' ? ['error', 'warn'] : ['error'],
    migrationsRun: false,
  };
};
