export const environment = {
  production: true,
  apiUrl: '/api/v1',
  // Set to a real project DSN from sentry.io to enable error monitoring in production —
  // blank means Sentry.init() no-ops, same sandbox-fallback pattern as the backend.
  sentryDsn: '',
};
