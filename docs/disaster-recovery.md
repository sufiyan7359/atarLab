# Disaster Recovery Runbook

This covers backing up and restoring the AtarLab Postgres database. The procedure below
was actually run end-to-end (not just written from theory) as part of Phase 5 hardening:
a real backup was taken, restored into a fresh database, and verified row-for-row before
being deleted.

## What's at risk

Postgres is the only stateful service in this stack (Redis, if used, holds nothing that
isn't safely reconstructable — no session state lives there). Everything that matters —
users, orders, payments, inventory, content — lives in one database. A backup strategy
for that one database is the entire DR story here.

## Backup

```bash
pg_dump -U <db_user> -d <db_name> -F c -f atarlab-$(date +%Y%m%d-%H%M).dump
```

`-F c` (custom format) is used rather than plain SQL: it's compressed, supports parallel
restore (`pg_restore -j`), and lets you restore a subset of objects if you ever only need
one table back rather than the whole database.

**In production**, don't run this by hand:
- Managed Postgres (RDS, Cloud SQL, Render/Railway's managed offering, etc.) — enable
  automated daily snapshots with point-in-time recovery (PITR) via WAL archiving. This is
  the recommended path; it gives you restore-to-any-second within the retention window,
  not just restore-to-last-nightly-dump.
- Self-hosted Postgres — cron `pg_dump` nightly plus continuous WAL archiving to
  object storage (S3-compatible) if you need PITR rather than only nightly granularity.
- Either way: **store backups off the database host** (object storage, not a sibling
  directory on the same disk) — a backup that dies with the same disk as the database
  protects against nothing.

Retention: keep at least 7 daily + 4 weekly + 3 monthly snapshots. Encrypt backups at
rest if they leave your own infrastructure's storage (they contain password hashes,
order/payment history, and PII).

## Restore

```bash
createdb -U <db_user> <target_db>
pg_restore -U <db_user> -d <target_db> --no-owner --no-acl <dump_file>
```

`--no-owner --no-acl` matters when restoring into an environment where the role names
don't match the source (e.g. restoring a production dump into a local dev Postgres) —
without it, `pg_restore` tries to `ALTER OWNER` to roles that may not exist there and
either fails or silently skips ownership grants.

### Verified drill (Phase 5)

Ran against the actual local database:

1. `pg_dump -U $(whoami) -d atarlab -F c -f test-drill.dump`
2. `createdb -U $(whoami) atarlab_restore_drill`
3. `pg_restore -U $(whoami) -d atarlab_restore_drill --no-owner --no-acl test-drill.dump`
4. Compared row counts for `users`, `products`, `orders`, `order_items` between source and
   restored copy — **identical** (3 / 30 / 7 / 10).
5. Spot-checked a specific row (`admin@atarlab.com`'s `fullName`) — matched exactly.
6. Confirmed the `migrations` table itself came through (9/9 rows) — a restored database
   can immediately run `npm run migration:run` for any migrations created *after* the
   backup was taken, without TypeORM trying to re-apply ones already in the dump.
7. Dropped the drill database and deleted the dump file — this was a verification
   exercise, not a standing backup.

### After restoring in a real incident

1. Point `DB_HOST`/`DB_NAME`/etc. at the restored database (or restore in-place if that's
   the recovery path your hosting provider supports).
2. Run `npm run migration:run` — picks up anything newer than the backup.
3. If the backup predates the incident by more than a few minutes, expect to lose any
   writes between the backup and the outage unless you're on PITR/WAL archiving — this is
   the gap that automated backups (above) exist to close, since the restore mechanics
   themselves are identical either way.
4. Recheck `refresh_tokens` — sessions active at backup time are still valid rows, but if
   the incident involved a suspected credential compromise, revoke all sessions
   (`UPDATE refresh_tokens SET revoked_at = now() WHERE revoked_at IS NULL`) rather than
   trusting a stale backup's session state.

## What this doesn't cover

- **Uploaded media** (`atarlab-backend/uploads/` in the local-disk sandbox fallback, or
  Cloudinary in production): Cloudinary is itself durable/replicated storage once real
  credentials are configured, so there's nothing to back up there. The local-disk fallback
  is sandbox-only and explicitly not meant to survive a real incident.
- **Application code**: recovered via git/GitHub, not this runbook.
- **Secrets** (JWT keys, Razorpay/Cloudinary/Mail credentials): see `docs/secrets-rotation.md`.
