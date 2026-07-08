# Secrets Rotation Runbook

Every secret AtarLab depends on, what rotating it actually does to running sessions/
integrations, and the steps to do it safely.

## JWT_ACCESS_SECRET

Signs every access token (15min expiry by default). Rotating it **immediately
invalidates every currently-issued access token** — every logged-in user gets a 401 on
their next request. That's not fatal: the frontend's `AuthRefreshCoordinator` calls
`/auth/refresh` automatically on a 401, and the refresh-token cookie (a separate,
unrelated secret — see below) is still valid, so users get a new access token
transparently and don't notice anything beyond a slightly slower one request.

**Rotate when**: routine hygiene (e.g. annually), or immediately if the secret leaked
(committed to a public repo, exposed in a log, etc).

**Steps**:
1. Generate a new value: `openssl rand -hex 32`.
2. Update `JWT_ACCESS_SECRET` in the environment (whatever your deploy target's secret
   manager is — this app reads it via `process.env`, nothing else to touch).
3. Restart the backend. No user-facing downtime beyond the single-request refresh
   described above; no database change needed.

## JWT_REFRESH_SECRET

**Currently unused.** It's required by `validation.schema.ts` and threaded through
`configuration.ts`, but refresh tokens in this app are opaque random values (32 bytes,
argon2-hashed in the `refresh_tokens` table — see `TokenService`), not JWTs. This env var
is vestigial from early scaffolding. Rotating it does nothing; it's flagged here so a
future incident responder doesn't waste time on it, not as a rotation step to perform.
The actual "refresh token secret" is the per-token random value stored (hashed) in
Postgres — see the "session revocation" section of `docs/auth-flow.md` for how those get
invalidated (rotation on every use, family-scoped reuse detection, revoke-all-for-user on
password reset).

## Database password (DB_PASSWORD)

1. In Postgres: `ALTER USER atarlab WITH PASSWORD 'new-password';`
2. Update `DB_PASSWORD` in the environment.
3. Restart the backend (it'll reconnect with the new credential; TypeORM doesn't hot-swap
   a live pool's credentials).
4. Old connections using the old password are unaffected until they're recycled — there's
   no forced-disconnect step needed for a routine rotation. For a suspected-compromise
   rotation, also review `pg_stat_activity` for connections you don't recognize before
   and after.

## Razorpay (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET / RAZORPAY_WEBHOOK_SECRET)

Rotate key/secret from the Razorpay dashboard (Settings → API Keys). The webhook secret
is separate — it's configured both in the Razorpay dashboard's webhook settings *and* in
this app's env; both sides must be updated together or webhook signature verification
(`RazorpayProvider.verifyWebhookSignature`) starts rejecting legitimate webhooks.

**Order of operations matters**: generate the new webhook secret in Razorpay, update it
in both places, *then* save — don't let there be a window where Razorpay is sending with
the new secret while the app still expects the old one, since every webhook in that
window gets rejected as an invalid signature (payment confirmations would silently fail
to mark orders paid).

## Cloudinary (CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET)

Rotate from the Cloudinary console (Settings → Security). No signature-matching concern
like Razorpay's webhook secret — this is used purely for authenticating upload requests
this app makes *to* Cloudinary, not for verifying anything Cloudinary sends back. Update
the env vars and restart; in-flight uploads at the moment of rotation may fail once and
succeed on retry (the frontend's upload calls aren't automatically retried, so a user
mid-upload during a rotation would need to retry manually — this is a narrow enough
window that scheduling rotations outside business hours avoids it in practice).

## Mail (MAIL_USER / MAIL_PASSWORD)

Whatever SMTP provider is configured (Mailtrap/SES/etc — see `docs/deployment.md`).
Rotate from the provider's console, update env vars, restart. If unset entirely, `MailModule`
falls back to logging emails to the console instead of sending (the sandbox behavior used
throughout local development) — rotating into an *unset* state is a valid "pause outbound
email" lever if needed, not just a broken state.

## Google OAuth (GOOGLE_CLIENT_SECRET)

Rotate from the Google Cloud Console (APIs & Services → Credentials). Existing sessions
are unaffected (the secret is only used during the initial OAuth code exchange, not
stored or checked again after); only *new* Google sign-ins during the rotation window
could fail if the two sides are out of sync, same ordering caution as Razorpay's webhook
secret above.

## After any rotation prompted by a suspected leak (not routine hygiene)

1. Rotate the specific leaked secret per its section above.
2. `UPDATE refresh_tokens SET revoked_at = now() WHERE revoked_at IS NULL;` — force
   every user to re-authenticate, in case the leak also exposed session cookies.
3. Check `activity_logs` for admin mutations in the suspected window that don't match
   known admin activity.
4. If the leak was a committed secret (e.g. an `.env` accidentally pushed to git), the
   value is permanently compromised even after rotation for anyone who already cloned
   that history — rotating the secret is necessary but treat the repository's git history
   itself as needing a hard look (BFG Repo-Cleaner / git-filter-repo to purge it, and
   awareness that any prior clone already has it).
