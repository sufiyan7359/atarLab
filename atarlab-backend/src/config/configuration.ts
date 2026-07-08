import { Duration } from '../common/types/duration.type';

export interface AppConfig {
  env: string;
  port: number;
  apiPrefix: string;
  corsOrigin: string;
  frontendUrl: string;
  publicUrl: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    ssl: boolean;
    poolSize: number;
  };
  redis: { host: string; port: number };
  jwt: {
    accessSecret: string;
    accessExpiresIn: Duration;
    refreshSecret: string;
    refreshExpiresIn: Duration;
  };
  google: { clientId: string; clientSecret: string; callbackUrl: string };
  mail: { host: string; port: number; user: string; password: string; from: string };
  razorpay: { keyId: string; keySecret: string; webhookSecret: string };
  cloudinary: { cloudName: string; apiKey: string; apiSecret: string };
}

export default (): { app: AppConfig } => ({
  app: {
    env: process.env.NODE_ENV ?? 'local',
    port: parseInt(process.env.PORT ?? '3000', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api/v1',
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:4200',
    publicUrl: process.env.BACKEND_PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? '3000'}`,
    database: {
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME ?? 'atarlab',
      password: process.env.DB_PASSWORD ?? '',
      name: process.env.DB_NAME ?? 'atarlab',
      ssl: process.env.DB_SSL === 'true',
      // node-postgres defaults to 10 — load-testing showed 20 concurrent requests
      // saturating that pool (queuing for a free connection, not slow queries) well
      // before the DB or app CPU were under any real pressure. Tunable per-environment.
      poolSize: parseInt(process.env.DB_POOL_SIZE ?? '20', 10),
    },
    redis: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    },
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
      accessExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as Duration,
      refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
      refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as Duration,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? '',
    },
    mail: {
      host: process.env.MAIL_HOST ?? '',
      port: parseInt(process.env.MAIL_PORT ?? '2525', 10),
      user: process.env.MAIL_USER ?? '',
      password: process.env.MAIL_PASSWORD ?? '',
      from: process.env.MAIL_FROM ?? 'AtarLab <no-reply@atarlab.com>',
    },
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID ?? '',
      keySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? '',
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
      apiKey: process.env.CLOUDINARY_API_KEY ?? '',
      apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
    },
  },
});
