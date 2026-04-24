# Evergreen Cottages — Booking Website

## Project Overview

Guest-facing vacation rental booking website for Evergreen Cottages in Pensacola, FL. Replaces evergreencottages.holidayfuture.com. Built for direct bookings (bypassing Airbnb/VRBO fees), stay extensions, service add-ons, and guest reservation details. Connected to [hostaway-data-hub](https://github.com/PrecisionDevTeam/hostaway-data-hub) via shared Railway Postgres.

**Production URL:** https://www.evergreencottagespensacola.com  
**Railway service:** `evergreen-cottages` (deploys from `origin` remote on push to `master`)

## Tech Stack

- **Framework:** Next.js (Pages Router) + TypeScript
- **Styling:** Tailwind CSS with custom coastal palette (sand/ocean/coral)
- **Fonts:** DM Serif Display (headings) + DM Sans (body) via Google Fonts
- **Database:** Railway Postgres (shared with hostaway-data-hub — same `DATABASE_URL`)
- **ORM:** Prisma (mapped to existing tables, NOT creating new ones)
- **Images:** Next.js `<Image>` component with `remotePatterns` for Hostaway S3
- **Payments:** Stripe (Checkout Sessions, webhooks, promo codes, gift cards, extensions)
- **Security:** CSRF origin check, rate limiting, input validation, Stripe signature verification

## Project Structure

```
evergreen-cottages/
├── src/
│   ├── pages/
│   │   ├── index.tsx              # Home page (hero, dynamic stats, properties, reviews)
│   │   ├── properties/
│   │   │   ├── index.tsx          # All properties with search, filters, sort, price range, compare
│   │   │   └── [id].tsx           # Property detail with gallery, booking, reviews, share, nearby, recently viewed
│   │   ├── stay/
│   │   │   └── [token].tsx        # My Stay — private guest reservation page
│   │   ├── extend/
│   │   │   └── [token].tsx        # Stay extension page (HMAC-verified token, calendar picker, Stripe checkout)
│   │   ├── booking/
│   │   │   └── success.tsx        # Post-payment success page (handles all checkout types)
│   │   ├── services.tsx           # Add-on services (guest form, auto-trigger from check-in page)
│   │   ├── about.tsx              # About page (stats from DB)
│   │   ├── contact.tsx            # Contact form
│   │   ├── faq.tsx                # FAQ page (6 sections, 20 questions, accordion)
│   │   ├── gallery.tsx            # Photo gallery (masonry layout, lightbox)
│   │   ├── gift-cards.tsx         # Gift card purchase page
│   │   ├── shop.tsx               # Add-on shop (wine, snacks, extras)
│   │   ├── terms.tsx              # Terms of service
│   │   ├── privacy.tsx            # Privacy policy
│   │   ├── 404.tsx                # Custom branded 404 page
│   │   ├── sitemap.xml.tsx        # Dynamic XML sitemap
│   │   └── _app.tsx               # App wrapper (progress bar)
│   │   └── api/
│   │       ├── checkout.ts        # Stripe session for property bookings
│   │       ├── extension-checkout.ts  # Stripe session for stay extensions (same/other unit)
│   │       ├── service-checkout.ts    # Stripe session for services (name + unit pre-filled from URL params; server-side date lookup from DB by unit; no email pre-fill on unauthenticated form)
│   │       ├── shop-checkout.ts       # Stripe session for shop items
│   │       ├── webhook.ts         # Stripe webhook → Hostaway reservation + service/extension notifications
│   │       ├── gift-card.ts       # Gift card purchase
│   │       ├── validate-promo.ts  # Promo code validation
│   │       ├── contact.ts         # Contact form submission
│   │       └── revalidate.ts      # On-demand ISR cache refresh
│   ├── components/
│   │   ├── Layout.tsx             # Shared nav + footer + SEO meta + OG/Twitter cards
│   │   ├── PropertyCard.tsx       # Property card (carousel, favorites, compare, social proof)
│   │   ├── ImageCarousel.tsx      # Image carousel with skeleton loading
│   │   ├── AvailabilityCalendar.tsx # Calendar picker with accessibility
│   │   └── Breadcrumbs.tsx        # Reusable breadcrumb navigation
│   ├── lib/
│   │   ├── db.ts                  # Prisma queries (properties, calendar, reviews, booking counts, stay tokens)
│   │   ├── api-security.ts        # CSRF verification (verifyOrigin), rate limiting, input sanitization
│   │   └── localStorage.ts       # Client-side hooks (recently viewed, favorites)
│   ├── types/
│   │   └── index.ts               # Shared TypeScript types
│   └── styles/
│       └── globals.css            # Tailwind + Google Fonts + animations + grain overlay
├── prisma/
│   └── schema.prisma              # Mapped to existing Railway Postgres tables
├── public/
│   └── robots.txt                 # Search engine crawling rules
├── tailwind.config.js             # Coastal palette (sand, ocean, coral, evergreen)
├── next.config.js                 # Image domains, Stripe env
└── .env.local                     # DATABASE_URL + Stripe keys
```

## Database

This project reads from the SAME Railway Postgres database as hostaway-data-hub.

### Tables Read (owned by hostaway-data-hub)
- `properties` — 33 properties with descriptions, amenities, up to 41 images, pricing
- `reservations` — booking data (used for extension lookups + guest email resolution)
- `guests` — guest profiles (email for Stripe pre-fill)
- `hostaway_calendar` — daily availability per listing
- `hostaway_reviews` — guest reviews with ratings
- `property_knowledge` — WiFi, gate codes, parking, rules (key-value per property)
- `seam_access_codes` — Schlage door codes per reservation
- `reservation_extensions` — links original booking to extension (for auto-detection)

### Tables Created
- `stay_tokens` — unique private links for My Stay page (token → reservation_id, expires_at)
- `website_property_overrides` — admin-editable display names, descriptions, images per property
- `website_content` — editable homepage/services/FAQ content (JSON)
- `contact_submissions` — contact form messages
- `processed_stripe_events` — Stripe webhook idempotency guard

## Pricing Conventions (CRITICAL)

### Hostaway Calendar Convention
Hostaway stores calendar entries where the **date key = checkout date for that night**.
- Entry for `Apr 27` = price for the night Apr 26 → Apr 27
- Entry for `Apr 30` = price for the night Apr 29 → Apr 30

### Pricing Loop (both page and API must use the same)
```typescript
// checkIn=Apr26, checkOut=Apr30, nights=4
// Loop i=1..nights → keys: Apr27, Apr28, Apr29, Apr30
for (let i = 1; i <= nights; i++) {
  const d = new Date(checkInDate);
  d.setDate(d.getDate() + i);
  const key = d.toISOString().split("T")[0];
  subtotal += calendarPrices[key] || fallbackPrice;
}
```

### Prisma Date → Key Conversion (server-side)
Prisma returns `Date` objects. `String(date)` produces a locale-dependent string — never use it directly for a calendar key. Use:
```typescript
const key = day.date instanceof Date
  ? day.date.toISOString().split("T")[0]
  : String(day.date).split("T")[0]; // handles already-serialized ISO strings (e.g. from Next.js props)
```

### Cleaning Fee
Hardcoded `$65` for all units everywhere — do NOT read `property.cleaning_fee` from DB. Some units have stale/wrong values in that column.

### Extension Discount
5% nightly discount for extensions (same-unit and other-unit). Noah's math: Airbnb charges hosts 15.5% → keep 10% as margin/damage buffer → pass 5% to guest. Configured via data-hub admin settings (`discount_percent`); code fallback is also `5`.

### Website Display Names
Always use `WebsitePropertyOverride.website_name` for Stripe line item names, payment descriptions, and metadata — NOT `property.name` (which is the raw internal Hostaway name like "Cozy Stay and Modern Comforts Unit 14").

## Services Page (`/services`)

Guest pays for add-ons (early check-in, pet fee, gaming WiFi, etc.).

### URL Param Pre-fill
Check-in page passes `?service=`, `?property=`, `?unit=`, `?name=` when guest taps a service card. `services.tsx` reads these on mount and pre-fills the form — guest only needs to tap Pay.

### `service-checkout.ts` Security Rules
- `unitLabel` is stripped to digits-only before DB lookup (`replace(/\D/g, "")`) — prevents substring injection across unit names
- DB lookup uses `equals` (not `contains`) on property name to prevent matching "Unit 1" when "10" is typed
- **No email pre-fill** — unauthenticated form; pre-filling email from DB would expose prior guest's email
- Lookup finds **current active stay only** (`check_in <= now AND check_out >= now`) — prevents leaking a future guest's dates
- `checkInDate` + `checkOutDate` passed to Stripe metadata for SMS/Discord notification context (looked up server-side, not from form input)

## Security

### CSRF (`src/lib/api-security.ts`)
`verifyOrigin` allows:
- `https://evergreencottagespensacola.com`
- `https://www.evergreencottagespensacola.com`
- `http://localhost` (any port) — local dev only

Do NOT add Railway internal URLs (`.up.railway.app`) to this list.

### Extension Token Format
Two formats supported by `verifyToken()` in `extension-checkout.ts`:

**v2 (current):** `v2.{resId}.{guestId}.{variant}.{exp}.{sig}`
- HMAC-SHA256 over `v2:{resId}:{guestId}:{variant}:{exp}`
- `exp` = Unix timestamp, checked server-side
- `variant` in token can be stale — server re-derives from property comparison

**v1 (legacy):** `{resId}.{guestId}.{sig}`
- No expiry, no variant — treated as `same` unit

Both use `EXTENSION_SECRET` env var. Token generated by `hostaway-data-hub/src/auto_reply/extension_link.py`.

## Extension Flow (`/extend/[token]`)

1. Guest opens link sent by data-hub (SMS/message). Token verified server-side via HMAC.
2. Page shows two options: stay in same unit or move to another available unit.
3. Guest selects dates → page shows pricing (nightly × nights × 95% + cleaning fee if switching units).
4. Guest clicks Pay → `POST /api/extension-checkout` → Stripe Checkout Session.
5. On success → `POST /api/webhook` (Stripe) → creates Hostaway reservation + notifies Noah.

**Live availability check:** For unit-swap (other-unit variant), server calls Hostaway API directly to verify real-time availability. For same-unit, relies on cached calendar (guest is already in the unit).

## Key Conventions

- All data queries go through `src/lib/db.ts` (Prisma)
- Shared types in `src/types/index.ts` — never duplicate types across pages
- All pages use `<Layout>` component for nav/footer/SEO
- Property cards use `<PropertyCard>` component
- Use `getStaticProps` with ISR (`revalidate`) for listing pages, `getServerSideProps` for detail pages needing auth/token
- Use Next.js `<Image>` for all images (not `<img>`)
- `JSON.parse(JSON.stringify())` for serializing Prisma dates in `getServerSideProps` props (converts `Date` → ISO string)
- SVG icons throughout — no emojis in production UI
- All Stripe success/cancel URLs hardcoded to `https://www.evergreencottagespensacola.com/...` — do NOT use `NEXT_PUBLIC_BASE_URL` for these (was pointing to Railway internal URL)

## Running

```bash
npm install
npx prisma generate
npm run dev
# Open http://localhost:3000
```

## Environment Variables

```env
DATABASE_URL=                      # Railway Postgres (shared with hostaway-data-hub)
STRIPE_API_KEY=                    # Stripe secret key
STRIPE_WEBHOOK_SECRET=             # Stripe webhook signing secret
EXTENSION_SECRET=                  # HMAC secret for extension tokens (must match data-hub)
WEBHOOK_SECRET=                    # Bearer token for internal webhook auth
REVALIDATE_SECRET=                 # Secret for on-demand ISR revalidation
HOSTAWAY_ACCOUNT_ID=               # For live Hostaway availability check on unit-swap extensions
HOSTAWAY_API_KEY=                  # For live Hostaway availability check on unit-swap extensions
DATA_HUB_URL=                      # Data hub base URL (for fetching extension settings)
NEXT_PUBLIC_BASE_URL=              # (optional) Not used for Stripe URLs — those are hardcoded
```

## Related

- [hostaway-data-hub](https://github.com/PrecisionDevTeam/hostaway-data-hub) — backend system that populates the database, sends extension links to guests via `src/auto_reply/extension_link.py`

## Business Context

- **Owner:** Noah Hoffman (Precision Management)
- **Properties:** 17 units at 3801 Mobile Hwy, Pensacola FL 32505 (+ 16 non-Pensacola)
- **Goal:** Direct bookings to avoid Airbnb/VRBO host fees (15.5%). Guest saves 5% vs Airbnb prices; owner keeps the rest as margin.
- **Phone:** (510) 822-7060
- **Email:** hello@staywithprecision.com
- **Extension offers:** Sent automatically by data-hub at 3 PM CST the day before checkout (Pensacola only)
