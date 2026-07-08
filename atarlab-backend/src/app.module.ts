import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { buildTypeOrmOptions } from './config/database.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { HealthModule } from './health/health.module';
import { MailModule } from './modules/mail/mail.module';
import { RolesPermissionsModule } from './modules/roles-permissions/roles-permissions.module';
import { UsersModule } from './modules/users/users.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ProductsModule } from './modules/products/products.module';
import { SearchModule } from './modules/search/search.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { CartModule } from './modules/cart/cart.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { BannersModule } from './modules/banners/banners.module';
import { OffersModule } from './modules/offers/offers.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { ActivityLogInterceptor } from './modules/activity-logs/activity-log.interceptor';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ContentModule } from './modules/content/content.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    // Global default for everything not explicitly overridden (auth endpoints get tighter
    // per-route limits — see AuthController). 100/min turned out too tight for legitimate
    // catalog browsing once instant-search-suggestions started firing per debounced
    // keystroke (Phase 4) — a single active user's normal browsing could trip it.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildTypeOrmOptions,
    }),
    HealthModule,
    MailModule,
    RolesPermissionsModule,
    UsersModule,
    AddressesModule,
    AuthModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    SearchModule,
    CouponsModule,
    CartModule,
    WishlistModule,
    PaymentsModule,
    OrdersModule,
    ReviewsModule,
    BannersModule,
    OffersModule,
    UploadsModule,
    InventoryModule,
    ActivityLogsModule,
    AnalyticsModule,
    SettingsModule,
    TrackingModule,
    DeliveryModule,
    NotificationsModule,
    ContentModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    { provide: APP_INTERCEPTOR, useExisting: ActivityLogInterceptor },
  ],
})
export class AppModule {}
