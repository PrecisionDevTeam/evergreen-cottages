# Evergreen Cottages — Booking Website

Guest-facing website for Evergreen Cottages, 17 vacation rentals in Pensacola, FL. Direct booking, reservation details, stay extensions, and guest services. Replaces the FutureStay/HolidayFuture booking engine.

**Production:** https://www.evergreencottagespensacola.com

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero, trust stats, featured properties, guest reviews, services CTA |
| Properties | `/properties` | All units with filters, sort, price range slider, side-by-side compare |
| Property Detail | `/properties/[id]` | Full gallery (up to 41 photos), live price calculator, booking card, amenities, reviews |
| Stay Extension | `/extend/[token]` | HMAC-verified extension page — same-unit or unit-swap, calendar picker, Stripe checkout |
| My Stay | `/stay/[token]` | Private guest page — door code, WiFi, gate code, parking, rules, troubleshooting link |
| Services | `/services` | Add-on services — early check-in, pet fee, gaming WiFi, etc. Name + unit pre-filled from URL params when arriving from check-in page |
| Gift Cards | `/gift-cards` | Gift card purchase via Stripe |
| Shop | `/shop` | Add-on shop (wine, snacks, extras) via Stripe |
| About | `/about` | Company info, stats from DB (review count + avg rating), location |
| Contact | `/contact` | Phone, email, address, working contact form |
| FAQ | `/faq` | 6 sections, 20 questions, accordion UI |
| Gallery | `/gallery` | Masonry photo gallery with lightbox |
| Booking Success | `/booking/success` | Post-payment landing page (handles all checkout types) |

## Design

**Aesthetic:** Coastal Editorial — warm sand tones, deep ocean blues, coral accents
- **Fonts:** DM Serif Display (headings) + DM Sans (body) via Google Fonts
- **Colors:** Sand (#faf8f5) background, ocean (#1a3a4a) text, coral (#e07c5a) accents
- **Effects:** Grain texture overlay, fade-in/stagger animations, card hover lift, scroll-aware nav
- **Icons:** SVG icons throughout (no emojis)

## Tech Stack

- **Framework:** Next.js (Pages Router) + TypeScript
- **Styling:** Tailwind CSS with custom coastal palette
- **Database:** Railway Postgres (shared with hostaway-data-hub)
- **ORM:** Prisma
- **Payments:** Stripe (Checkout Sessions, webhooks, promo codes, gift cards)
- **Deployment:** Railway (`evergreen-cottages` service, us-west2)

## Data

All property data comes from the existing hostaway-data-hub Railway Postgres database:

| Table | Data |
|-------|------|
| `properties` | 33 properties (17 Pensacola) — descriptions, amenities, up to 41 images, pricing |
| `reservations` | Booking data with check-in/out dates, guest info, status |
| `guests` | Guest profiles (email for Stripe pre-fill on service checkout) |
| `hostaway_calendar` | Availability + pricing per listing per day |
| `hostaway_reviews` | Guest reviews with ratings, reviewer name, dates |
| `property_knowledge` | WiFi passwords, gate codes, parking info, house rules |
| `seam_access_codes` | Schlage smart lock door codes per reservation |
| `stay_tokens` | Unique private links for My Stay page |
| `reservation_extensions` | Links original booking to extension booking |
| `website_property_overrides` | Display names/descriptions/images that override raw Hostaway data |

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# Fill in DATABASE_URL, STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET, EXTENSION_SECRET

npx prisma generate
npm run dev
```

Open http://localhost:3000

## Environment Variables

```env
DATABASE_URL=                   # Railway Postgres — same as hostaway-data-hub
STRIPE_API_KEY=                 # Stripe secret key
STRIPE_WEBHOOK_SECRET=          # Stripe webhook signing secret
EXTENSION_SECRET=               # HMAC secret for extension tokens (must match data-hub)
WEBHOOK_SECRET=                 # Bearer auth for internal endpoints
REVALIDATE_SECRET=              # On-demand ISR revalidation secret
HOSTAWAY_ACCOUNT_ID=            # Live availability check on unit-swap extensions
HOSTAWAY_API_KEY=               # Live availability check on unit-swap extensions
DATA_HUB_URL=                   # Data hub base URL (fetches extension discount settings)
```

## Key Features

### Direct Booking
- Property listing with filters (Pets OK, 4+ Guests, 1+ Bedroom), sort, price range
- Live price calculator on property detail page — sums actual Hostaway calendar nightly rates
- Stripe Checkout Session with promo code support
- Cleaning fee: **$65 flat for all units** (hardcoded — DB field is unreliable)
- Stripe line items use website display names from `website_property_overrides`, not raw Hostaway names

### Stay Extension (`/extend/[token]`)
- HMAC-signed tokens (v2: expiring with variant; v1 legacy: no expiry)
- Two options: extend in same unit (no cleaning fee) or move to another available unit ($40 reduced cleaning fee, configurable in data-hub admin)
- 5% nightly discount for both variants
- Server-side live availability check via Hostaway API for unit-swaps
- Pricing loop: `i=1..nights` (Hostaway calendar stores entries by checkout date, not check-in)
- Prices pinned server-side — client cannot manipulate amounts
- Extension links sent automatically by hostaway-data-hub at 3 PM CST day before checkout

### My Stay Page
- Unique private link per reservation: `www.evergreencottagespensacola.com/stay/{token}`
- Shows: door code, WiFi, gate code, parking, check-in/out times, house rules
- Links to troubleshooting portal and add-on services
- Expires 7 days after checkout — no login required

### Security
- CSRF protection via `verifyOrigin` (allows bare domain + www only)
- Rate limiting (10 req/min per IP) on all checkout endpoints
- HMAC-SHA256 token verification for extension links (timing-safe comparison)
- Stripe webhook signature verification
- Input validation + date format guards on all API routes

## Pricing Convention (IMPORTANT)

Hostaway calendar: entry date = **checkout date for that night** (Apr 27 entry = night Apr 26→27).
Both the page display and the API must use `i=1..nights` so keys run `checkIn+1..checkOut`.
Never use `i=0..nights-1` — that looks up the wrong nights and prices won't match Stripe.

## Related

- [hostaway-data-hub](https://github.com/PrecisionDevTeam/hostaway-data-hub) — backend data hub, admin dashboard, 13 AI auto-reply modules, Seam smart locks, cleaning app, automated extension offers
