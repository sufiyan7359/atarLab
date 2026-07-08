import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Authenticated-only routes: rendered entirely client-side. Session restoration only
  // ever runs in the browser (see AuthBootstrapService), so a guard evaluated during SSR
  // would always see "logged out" and incorrectly bounce a real, logged-in user — these
  // routes skip SSR so their guards only ever run after the client has resolved auth state.
  { path: 'checkout', renderMode: RenderMode.Client },
  { path: 'checkout/success/:orderId', renderMode: RenderMode.Client },
  { path: 'cart', renderMode: RenderMode.Client },
  { path: 'wishlist', renderMode: RenderMode.Client },
  { path: 'account/**', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  // Everything else (home, catalog, product detail, auth pages) is public and safe to
  // render per-request on the server for SEO — it renders logged-out and personalizes
  // (header, cart badge, etc.) after client hydration.
  { path: '**', renderMode: RenderMode.Server },
];
