export const environment = {
  production: true,
  // Absolute, not relative: this is deployed as two separate Render services (frontend +
  // backend), each with its own origin — there's no reverse proxy putting them on one
  // origin here, so a relative '/api/v1' would resolve against the frontend's own host.
  // Must match the backend service's name in render.yaml exactly (atarlab7359-backend) —
  // if that service is ever renamed, update this to match its new host.
  apiUrl: 'https://atarlab7359-backend.onrender.com/api/v1',
  // Set to a real project DSN from sentry.io to enable error monitoring in production —
  // blank means Sentry.init() no-ops, same sandbox-fallback pattern as the backend.
  sentryDsn: '',
};
