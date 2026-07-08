export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  // Left blank in dev on purpose — Sentry.init() with an empty dsn is a safe no-op.
  sentryDsn: '',
};
