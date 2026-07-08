// Must be imported first, before any other module, in main.ts — Sentry needs to patch
// things (http, pg, etc.) at load time. Sandbox fallback: Sentry.init() with an empty/
// unset DSN makes every SDK call (init, captureException) a safe no-op, so this behaves
// like every other optional integration in this app (Razorpay/Cloudinary/Mail) — real
// code path, inert until real credentials are configured.
import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'local',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});
