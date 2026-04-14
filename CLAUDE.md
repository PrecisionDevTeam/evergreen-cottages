# Evergreen Cottages — Booking Website

## Project Overview

Guest-facing vacation rental booking website for Evergreen Cottages in Pensacola, FL. Replaces evergreencottages.holidayfuture.com. Built for direct bookings (bypassing Airbnb/VRBO fees), stay extensions, service add-ons, and guest reservation details. Connected to [hostaway-data-hub](https://github.com/PrecisionDevTeam/hostaway-data-hub) via shared Railway Postgres.

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
│   │   │   └── [token].tsx        # Stay extension (HMAC-verified, calendar, Stripe checkout)
│   │   ├── services.tsx           # Add-on services (guest form, auto-trigger from check-in page)
│   │   ├── about.tsx              # About page (stats from DB)
│   │   ├── contact.tsx            # Contact form
│   │   ├── faq.tsx                # FAQ page (6 sections, 20 questions, accordion)
│   │   ├── gallery.tsx            # Photo gallery (masonry layout, lightbox)
│   │   ├── 404.tsx                # Custom branded 404 page
│   │   ├── sitemap.xml.tsx        # Dynamic XML sitemap
│   │   └── _app.tsx               # App wrapper (progress bar)
│   │   └── api/
│   │       ├── checkout.ts        # Stripe session for property bookings
│   │       ├── extension-checkout.ts  # Stripe session for stay extensions (no cleaning fee)
│   │       ├── service-checkout.ts    # Stripe session for services (pre-fills guest email from DB)
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
│   │   ├── api-security.ts        # CSRF verification, rate limiting, input sanitization
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
- `website_property_overrides` — admin-editable property names, descriptions, images
- `website_content` — editable homepage/services/FAQ content (JSON)
- `contact_submissions` — contact form messages
- `processed_stripe_events` — Stripe webhook idempotency guard

## Design System

### Colors
- **Sand** (#faf8f5 → #8a7a6a) — backgrounds, muted text
- **Ocean** (#e8f0f3 → #040b0e) — headings, CTAs, nav, footer
- **Coral** (#e07c5a) — accents, labels, highlights, progress bar
- **Evergreen** (#22c55e) — success states

### Typography
- Headings: `DM Serif Display` (serif) — editorial, warm
- Body: `DM Sans` (sans-serif) — clean, readable

### Animations
- `fade-in` / `fade-in-up` — page load animations
- `.stagger > *` — cascading delays on grid items
- `.card-lift` — hover elevation with shadow
- `.grain::after` — subtle noise texture overlay
- Scroll-aware nav — transparent on hero, solid on scroll

## Key Conventions

- All data queries go through `src/lib/db.ts` (Prisma)
- Shared types in `src/types/index.ts` — never duplicate types across pages
- All pages use `<Layout>` component for nav/footer/SEO
- Property cards use `<PropertyCard>` component
- Use `getStaticProps` with ISR (`revalidate`) for listing pages, `getServerSideProps` for detail pages
- Use Next.js `<Image>` for all images (not `<img>`)
- `JSON.parse(JSON.stringify())` for serializing Prisma dates in props
- SVG icons throughout — no emojis in production UI

## Running

```bash
npm install
npx prisma generate
npm run dev
# Open http://localhost:3000
```

## Related

- [hostaway-data-hub](https://github.com/PrecisionDevTeam/hostaway-data-hub) — backend system that populates the database this site reads from

## Business Context

- **Owner:** Noah Hoffman (Precision Management)
- **Properties:** 17 units at 3801 Mobile Hwy, Pensacola FL 32505 (+ 16 in Oakland, Dundalk, St. Louis)
- **Goal:** Direct bookings to avoid 10-15% Airbnb/VRBO commission fees
- **Phone:** (510) 822-7060
- **Email:** hello@staywithprecision.com
- **Current site:** evergreencottages.holidayfuture.com (being replaced)
