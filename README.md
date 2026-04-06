# Evergreen Cottages — Booking Website

Guest-facing website for Evergreen Cottages, 17 vacation rentals in Pensacola, FL. Direct booking, reservation details, and guest services. Replaces the FutureStay/HolidayFuture booking engine.

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero with beach photo, trust stats, featured properties, guest reviews, services CTA |
| Properties | `/properties` | All 17 units with filters (Pets OK, 4+ Guests, 1+ Bedroom), sort (name, price, guests) |
| Property Detail | `/properties/[id]` | Full gallery (up to 41 photos) with lightbox, price calculator, booking card, amenities |
| My Stay | `/stay/[token]` | Private guest page — door code, WiFi, gate code, parking, rules, troubleshooting link |
| Services | `/services` | Airport shuttle, early check-in, late checkout, stay extension, pet fee, pack-n-play |
| About | `/about` | Company info, stats from DB (review count + avg rating), location |
| Contact | `/contact` | Phone, email, address, working contact form with success state |

## Design

**Aesthetic:** Coastal Editorial — warm sand tones, deep ocean blues, coral accents
- **Fonts:** DM Serif Display (headings) + DM Sans (body) via Google Fonts
- **Colors:** Sand (#faf8f5) background, ocean (#1a3a4a) text, coral (#e07c5a) accents
- **Effects:** Grain texture overlay, fade-in/stagger animations, card hover lift, scroll-aware nav
- **Icons:** SVG icons throughout (no emojis)

## Tech Stack

- **Framework:** Next.js + TypeScript
- **Styling:** Tailwind CSS with custom coastal palette
- **Database:** Railway Postgres (shared with hostaway-data-hub)
- **ORM:** Prisma
- **Images:** Next.js Image component with lazy loading + optimization
- **Payments:** Stripe (pending API keys)
- **Deployment:** Railway or Vercel

## Data

All property data comes from the existing hostaway-data-hub Railway Postgres database:

| Table | Data |
|-------|------|
| `properties` | 33 properties (17 Pensacola) — descriptions, amenities, up to 41 images, pricing, address, lat/lng |
| `reservations` | Booking data with check-in/out dates, guest info, status |
| `hostaway_calendar` | Availability per listing per day (180 days out) |
| `hostaway_reviews` | Guest reviews with ratings, reviewer name, dates |
| `property_knowledge` | WiFi passwords, gate codes, parking info, house rules, laundry, trash |
| `seam_access_codes` | Schlage smart lock door codes per reservation |
| `stay_tokens` | Unique private links for My Stay page |

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

```env
# Database (Railway Postgres — same as hostaway-data-hub)
DATABASE_URL=postgresql://...

# Stripe (pending API keys from Noah)
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_SIGNING_SECRET=
```

## Key Features

### Property Listing
- Filter by: All, Pets OK, 4+ Guests, 1+ Bedroom
- Sort by: Name, Price (low/high), Most Guests
- Empty state with clear filters button
- ISR with hourly revalidation (not SSR on every request)

### Property Detail
- Full image gallery with lightbox (prev/next navigation, keyboard support)
- Live price calculator (updates total as dates change)
- Date inputs with min-date validation
- Book Now opens pre-filled email with dates, guests, and total
- Cancellation policy section
- Direct phone call CTA in booking card

### My Stay Page
- Unique private link per reservation: `evergreencottages.com/stay/a7f3x9k2m`
- Shows: door code, WiFi, gate code, parking, check-in/out times, house rules
- Links to troubleshooting portal and add-on services
- Expires 7 days after checkout
- No login required — just click the link

### Contact Form
- Working form submission (mailto fallback)
- Success state after send
- Required field validation

## Related

- [hostaway-data-hub](https://github.com/PrecisionDevTeam/hostaway-data-hub) — backend data hub, admin dashboard, 13 AI auto-reply modules, Seam smart locks, cleaning app, 370+ automation features
