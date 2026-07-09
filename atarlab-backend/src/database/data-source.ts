import 'dotenv/config';
import { DataSource } from 'typeorm';

// The production Docker image only ships compiled `dist/` output (no ts-node/src) —
// migration:run:prod points this same file at dist/**/*.js instead via NODE_ENV.
const isProd = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'atarlab',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'atarlab',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [isProd ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'],
  migrations: [
    isProd ? 'dist/database/migrations/*.js' : 'src/database/migrations/*.ts',
  ],
  synchronize: false,
});
