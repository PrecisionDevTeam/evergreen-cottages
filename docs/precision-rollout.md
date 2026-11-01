# Shared rental websites and renter portal

This change is staged source, not a completed production rollout.

## Architecture

- Keep the existing Evergreen Railway service and domain.
- Run the same evergreen-cottages repository as a second service with `NEXT_PUBLIC_SITE_BRAND=precision`. Its public root, catalog and details use the Precision pages; legacy Evergreen APIs are blocked on this service.
- Both services read the existing shared Postgres property database. Precision publishes only explicit `rental_listings` records with brand `precision` and `published=true`.
- The existing Precision Admin gains **Sites & Renters** at `/admin/rentals`. Its existing Website editor still controls Evergreen.
- Guest and resident accounts use a separate identity, cookie, JWT audience and signing secret. The shared portal lives at `https://precision-admin-production.up.railway.app/portal`.
- Portal maintenance requests create issues in the existing `maintenance_issues` queue. Only linked requests and safe status fields are visible to that renter.

## Before production

1. Confirm the real property inventory, rental terms, photos and rates. Every property in the existing database appears in the admin editor; no new property or term is inferred or auto-published.
2. The source order is confirmed: Hospitable, then Hostaway, then bookkeeping sheets for gaps. The admin is the intended operating record going forward, including long term rentals. Current portal payment records are verified manual entries, with unique source-system and transaction references. They do not charge money, generate a balance, or treat booking totals as receipts.
3. Identify the maintenance and conversation history to import, and verify its renter-to-stay mapping. Historical Hostaway, Quo and email conversations are not automatically exposed. Existing private admin notes remain private.
4. Provision database access for the additive migration and verify the production tables. The connected Railway OAuth tool exposes variable names but withholds secret values; this session could not access the real database.
5. Obtain access to GoDaddy DNS. A December 22, 2025 receipt records a one-year staywithprecision.com renewal; current registrar access and DNS routing remain unverified.

## Deployment order

1. Back up the shared database. Apply `precision-admin/scripts/migrate/rental-platform.sql`, then `precision-admin/scripts/migrate/rental-ledger.sql`, once each with `psql -v ON_ERROR_STOP=1`. It is transactional, additive and contains foreign keys and checks. **Do not run prisma db push against the shared production database**: the repo schema maps only part of the existing database.
2. Set a new cryptographically random `RENTAL_SESSION_SECRET` of at least 32 characters on the existing admin service. Set `RENTAL_PORTAL_ORIGIN=https://precision-admin-production.up.railway.app`. Retain its existing `SESSION_SECRET` and all other settings.
3. Deploy the admin change, verify authenticated admin access and the portal login, then publish verified Precision listings through Sites & Renters.
4. Create a second Railway service from evergreen-cottages using the same read/write database connection (inquiries write only their own table). Set `NEXT_PUBLIC_SITE_BRAND=precision` and `NEXT_PUBLIC_RENTER_PORTAL_URL=https://precision-admin-production.up.railway.app/portal` **before building**. Do not change the Evergreen service's site brand. Build and start with the existing scripts.
5. Attach staywithprecision.com and www.staywithprecision.com to the Precision service and apply Railway's exact returned DNS records in GoDaddy. Preserve all MX, SPF, DKIM, DMARC and verification records. Verify HTTPS, redirects, catalog, inquiry capture, portal login and account isolation.
6. To show Guest login on Evergreen, set the same `NEXT_PUBLIC_RENTER_PORTAL_URL` on Evergreen and rebuild after the portal is available.
7. Create renter accounts, verify identity, assign the correct reservation/lease, and share the single-use activation link through an authorized channel. No invitations, texts or emails are automatically sent.

Rollback the applications to their prior versions if needed and retain the additive tables and provenance. Revoke an individual stay assignment or disable an account to remove access without deleting its history.

## Validation

- Both projects pass TypeScript and optimized Next.js production builds. Evergreen's existing Stripe routes require a nonfunctional test placeholder at build time when no real environment is configured.
- The actual SQL migration was applied to isolated local Postgres after generating the baseline schema.
- Seventeen HTTP integration tests cover explicit publication, hidden listing access, exact origins, inquiry persistence, invitation consumption, admin/renter separation, scope isolation, payment provenance and duplicate rejection, maintenance projection, occupancy revocation, and session invalidation.
- Fixtures are synthetic and remain exclusively in the local test database. No production migration, property publication, guest account creation, message transmission, charge, refund, or DNS change was made.
- Existing dependency audit findings were observed during npm ci. Dependency upgrades are outside this feature; assess them before exposing a new login service publicly.

## Reproduce integration checks locally

Use an isolated loopback Postgres database named `precision_rentals_test`. The test script refuses other databases. Generate/apply the pre-change admin schema to that database, then apply rental-platform.sql. Generate the new Prisma client.

Run admin on localhost:3101 with that DATABASE_URL, a local SESSION_SECRET, a separate RENTAL_SESSION_SECRET (32+ characters), and RENTAL_PORTAL_ORIGIN=http://localhost:3101. Run the website on localhost:3100 with that DATABASE_URL, NEXT_PUBLIC_SITE_BRAND=precision, NEXT_PUBLIC_RENTER_PORTAL_URL=http://localhost:3101/portal and a nonfunctional STRIPE_API_KEY test placeholder.

From precision-admin run `node --test tests/rentals.integration.mjs tests/ledger.integration.mjs` with the same DATABASE_URL and SESSION_SECRET. Tests create tagged synthetic rows; they never connect to production. Use a fresh test database/server between full runs because authentication throttling intentionally persists within each running server.


## Source reconciliation and native lease records

The existing admin now also has `/admin/rental-ledger` (Leases & Imports). Create and track a stay or lease without creating a portal account first. Record monthly rent, deposit and due-day metadata, dated obligations, and separately verified payment/refund receipts. These records do not execute financial transactions, sign leases, schedule recurring debits or update external booking calendars. Those integrations remain rollout work.

Normalized imports are staged as source evidence. A source-system + record-kind + stable source-ID key prevents duplicates. Re-imports preserve revisions; updates to a linked agreement or mapped property become conflicts. Older snapshots cannot replace newer evidence. Review uses a fingerprint check and a transaction lock so a changed source cannot be approved from a stale screen. Source summaries and host payouts never generate renter receipts. Unknown years, identities and unit mappings remain unresolved.

Property source records can be explicitly linked to an existing unit or create a new property with Evergreen visibility off. Precision listings still require explicit publication and offered rental terms. Agreements must respect reviewed source-property mappings. Portal access requires an explicit grant to an account matching the verified agreement email. Revoking that grant removes access while retaining history.

Use `scripts/build-hostaway-review.py` to add a Hostaway CSV to a normalized package. It copies only allowlisted fields and retains export observation time; credential/code columns are excluded. Keep real source packages private and out of GitHub. The import screen accepts normalized JSON in bounded batches. It supports source-filtered pagination and revision inspection. No unattended synchronization or source-platform writes are configured.

Validation additionally includes four Python adapter tests for exact money parsing, complete dates, secret-field exclusion and source-ID integrity. The additive second migration and all 17 HTTP integration checks passed against isolated local Postgres with synthetic fixtures.
