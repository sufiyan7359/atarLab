import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { createValidationPipe } from './common/pipes/validation-pipe.factory';
import { AppConfig } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app')!;

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(compression());
  app.use(cookieParser());
  app.enableCors({ origin: appConfig.corsOrigin, credentials: true });
  app.setGlobalPrefix(appConfig.apiPrefix, { exclude: ['health', 'health/db'] });
  app.useGlobalPipes(createValidationPipe());
  // Sandbox fallback storage for uploads when Cloudinary isn't configured — see CloudinaryProvider.
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  if (appConfig.env !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('AtarLab API')
      .setDescription('REST API for the AtarLab luxury attar & perfume e-commerce platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(appConfig.port);
}

bootstrap();
