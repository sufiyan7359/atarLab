# Launch Readiness Checklist

What's actually done vs. what a real launch still needs, as of the end of Phase 5. This
project has never been deployed anywhere — everything below reflects local-development
state. Treat every unchecked item as a hard blocker for a real public launch, not optional
polish.

## Done (verified, not just built)

- [x] Full commerce core: browse, cart, checkout (Razorpay sandbox + COD), order history,
      invoices, reviews, wishlist (Phase 1).
- [x] Admin console with RBAC, catalog/inventory/order/content management, analytics,
      activity log (Phase 2).
- [x] Live order tracking over Socket.IO, delivery agent assignment, real-time
      notifications (Phase 3).
- [x] Content module (blog/FAQ/testimonials/social feed/newsletter), typo-tolerant search
      with instant suggestions and voice input, frequently-bought-together, PWA/offline
      shell, an accessibility pass, and a performance pass (Phase 4).
- [x] OWASP-style code review (found and fixed two real crash bugs), tuned rate limits,
      load-tested and fixed a real connection-pool + missing-index gap, a verified
      backup/restore drill, secrets rotation runbook, legal pages + cookie consent, and
      Sentry wired on both sides (Phase 5, this phase).

## Not done — genuine blockers

- [ ] **No real payment/storage/mail credentials anywhere.** Razorpay, Cloudinary, and
      SMTP are all in sandbox/no-op fallback mode by design (see each `.env.example`).
      Getting real test-mode credentials and confirming a real payment/email/upload round
      trip is the single biggest remaining gap — everything in this app has been verified
      against sandbox fallbacks, not the real integrations.
- [ ] **No hosting, no domain, no deployment has ever happened.** `docs/deployment.md`
      describes a target architecture (Docker + reverse proxy + managed Postgres) that has
      never actually been stood up. Phase 5's `fileReplacements` fix means the frontend
      now genuinely expects that reverse-proxy topology to exist — see the note added to
      `docs/deployment.md`.
  - [ ] Automated backups (the DR runbook was verified manually, once, locally — it is
        not wired to run on a schedule anywhere).
  - [ ] `SENTRY_DSN` / `sentryDsn` are blank — no error monitoring is actually collecting
        anything yet outside of this local verification.
- [ ] **No CI pipeline exists.** `docs/deployment.md` describes one; it was never created.
      Every check in this project (typecheck, lint, build, the various Playwright
      verification passes) has been run manually, on demand — nothing runs automatically
      on push or PR.
- [ ] **PWA icons are Angular CLI's default placeholder artwork**, not AtarLab branding —
      flagged when they were added in Phase 4, still unaddressed.
- [ ] **Legal pages are template content**, explicitly flagged in each page as not having
      had real legal review. Do not treat them as compliant as-is.
- [ ] **No load testing beyond a single local machine's numbers.** Phase 5's autocannon
      runs (20 concurrent connections, tiny seed dataset) validated that nothing is
      obviously broken and surfaced two real fixes (connection pool, missing index) — they
      are not a substitute for testing against production-scale data volume and real
      network conditions.
- [ ] **Google OAuth, SMS OTP provider**: both have real integration code but were never
      exercised against real credentials (Google OAuth requires a real client ID; SMS OTP
      delivery has no provider wired at all beyond the interface).
- [ ] **No accessibility audit beyond manual review** — Phase 4's a11y pass found and
      fixed real, specific issues by reading the code and computing contrast ratios; it is
      not a substitute for testing with an actual screen reader or an automated tool like
      axe/Lighthouse against a real running deployment.

## Recommended launch sequence

1. Get real (test-mode) Razorpay + Cloudinary + SMTP credentials; re-verify checkout,
   image upload, and transactional email against them specifically (not the sandbox
   fallbacks).
2. Stand up the infrastructure in `docs/deployment.md` in a staging environment; run the
   backup/restore drill from `docs/disaster-recovery.md` against *that* environment, not
   locally.
3. Wire a real CI pipeline (typecheck + lint + build, minimum) before allowing merges to
   `main`.
4. Set `SENTRY_DSN` in staging and deliberately trigger a test error end-to-end to confirm
   it actually reaches the Sentry dashboard (this project has only verified the SDK
   initializes and doesn't crash the app — not that events actually arrive anywhere, since
   no real DSN has ever been configured).
5. Replace the placeholder PWA icons and have the legal pages reviewed by counsel.
6. Soft launch to a small audience; watch Sentry + logs for a defined window (a week is a
   reasonable default) before a public announcement.
