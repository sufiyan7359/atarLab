import * as Sentry from '@sentry/angular';
import { ErrorHandler, mergeApplicationConfig } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

// Browser-only (this file never runs during SSR) — an empty dsn makes every Sentry
// call a safe no-op, same sandbox-fallback pattern used throughout the backend.
Sentry.init({
  dsn: environment.sentryDsn,
  environment: environment.production ? 'production' : 'development',
  tracesSampleRate: environment.production ? 0.1 : 1.0,
});

// The ErrorHandler override lives here (not in the shared app.config.ts) since that
// config is also merged into the SSR bootstrap, where Sentry.init() above never runs.
const browserConfig = mergeApplicationConfig(appConfig, {
  providers: [{ provide: ErrorHandler, useValue: Sentry.createErrorHandler() }],
});

bootstrapApplication(App, browserConfig)
  .catch((err) => console.error(err));
