# Evergreen Cottages — Booking Website

Guest-facing website for Evergreen Cottages, 17 vacation rentals in Pensacola, FL. Direct booking, reservation details, and guest services.

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero, why book direct, featured properties, reviews |
| Properties | `/properties` | All 17 units with photos, amenities, pricing |
| Property Detail | `/properties/[id]` | Full info, image gallery, booking card |
| My Stay | `/stay/[token]` | Guest's private reservation details (door code, WiFi, gate code, parking, rules) |
| Services | `/services` | Airport pickup, early check-in, late checkout, extension, pet fee |
| About | `/about` | Company info, stats, location |
| Contact | `/contact` | Phone, email, address, contact form |

## Tech Stack

- **Framework:** Next.js + TypeScript
- **Styling:** Tailwind CSS (Evergreen green/white theme)
- **Database:** Railway Postgres (shared with hostaway-data-hub)
- **ORM:** Prisma
- **Payments:** Stripe (pending API keys)
- **Deployment:** Railway or Vercel

## Data

All property data comes from the existing hostaway-data-hub Railway Postgres database:

- `properties` — 33 properties (17 Pensacola) with descriptions, amenities, images, pricing
- `reservations` — booking data with check-in/out dates, guest info
- `hostaway_calendar` — availability per listing
- `hostaway_reviews` — guest reviews with ratings
- `property_knowledge` — WiFi passwords, gate codes, parking info, house rules
- `seam_access_codes` — door codes per reservation
- `stay_tokens` — unique links for My Stay page

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# Add your DATABASE_URL to .env.local

npx prisma generate
npm run dev
```

Open http://localhost:3000

## Environment Variables

```
# Database (Railway Postgres)
DATABASE_URL=postgresql://...

# Stripe (pending)
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_SIGNING_SECRET=

# Next Auth
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

## My Stay Page

Guests access their reservation details via a unique private link:

```
https://evergreencottages.com/stay/a7f3x9k2m
```

- Token is random and unguessable
- Shows: door code, WiFi, gate code, parking, check-in/out times, house rules
- Links to troubleshooting portal and add-on services
- Expires 7 days after checkout
- No login required — just click the link

## Related

- [hostaway-data-hub](https://github.com/PrecisionDevTeam/hostaway-data-hub) — backend data hub, admin dashboard, auto-reply system
