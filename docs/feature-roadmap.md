# Evergreen Cottages Website — Feature Roadmap

**Last updated:** April 8, 2026

---

## Phase 5: Legal & Compliance (CRITICAL — do first)

| # | Feature | Effort | Impact | Notes |
|---|---------|--------|--------|-------|
| 76 | Privacy Policy page (/privacy) | Low | Critical | Required by law — site collects name, email, phone, billing via Stripe |
| 77 | Terms of Service page (/terms) | Low | Critical | Booking terms, liability, cancellation policy |
| 78 | Cookie Consent banner | Low | Critical | GDPR/CCPA requirement — simple dismiss/accept banner |
| 79 | Link Privacy + Terms in footer | Low | Critical | Standard footer placement |

## Phase 6: Analytics & Tracking (CRITICAL — can't optimize without data)

| # | Feature | Effort | Impact | Notes |
|---|---------|--------|--------|-------|
| 80 | Google Analytics 4 (GA4) | Low | Critical | Need measurement ID from Noah. Track page views, property views. |
| 81 | Conversion tracking events | Low | High | Track: checkout starts, completed bookings, service payments, gift cards |
| 82 | Meta Pixel (Facebook/Instagram ads) | Low | Medium | Retarget visitors who viewed properties but didn't book |
| 83 | Microsoft Clarity or Hotjar | Low | Medium | Heatmaps + session recordings — see where users drop off |

## Phase 7: Conversion Optimization (HIGH IMPACT — drives revenue)

| # | Feature | Effort | Impact | Notes |
|---|---------|--------|--------|-------|
| 84 | Dollar savings callout on booking card | Medium | High | "You save $52 vs Airbnb on this booking" — calculated per booking |
| 85 | Scarcity badges on properties | Medium | High | "Only X nights available this month" from calendar data |
| 86 | "Last booked X ago" social proof | Medium | High | Show recent booking activity per property |
| 87 | "Why Book Direct" callout on property pages | Low | High | Box with 3 bullets: save %, direct contact, smart lock |
| 88 | Contact form → server-side submission | Low | High | Replace mailto with API route — works without email client |
| 89 | Hero headline rewrite | Low | Medium | "Pensacola Beach Rentals — Save 15% vs Airbnb" (specific, not generic) |
| 90 | Hero property search widget | Medium | Medium | Date + guests + search directly in the hero section |
| 91 | Exit-intent popup / email capture | Medium | Medium | Capture visitors who leave without booking |

## Phase 8: SEO & Content (MEDIUM — organic growth)

| # | Feature | Effort | Impact | Notes |
|---|---------|--------|--------|-------|
| 92 | FAQPage schema on FAQ page | Low | Medium | Rich snippets in Google search results |
| 93 | BreadcrumbList schema | Low | Medium | Breadcrumb trail in Google search results |
| 94 | Optimize H1 tags with local keywords | Low | Medium | "Pensacola Vacation Rentals" not "Your Home Away From Home" |
| 95 | Internal links: guide ↔ properties | Low | Medium | Link area guide places to nearby properties |
| 96 | Blog / seasonal content | High | Medium | "Best Time to Visit Pensacola", "Spring Break Guide" |
| 97 | Property description SEO optimization | Medium | Medium | Rewrite descriptions with local keywords (not Hostaway dumps) |

## Phase 9: Accessibility (MEDIUM — compliance + inclusivity)

| # | Feature | Effort | Impact | Notes |
|---|---------|--------|--------|-------|
| 98 | Skip-to-content link | Low | Medium | Hidden link at top of page for keyboard users |
| 99 | Focus trap on modals (compare, lightbox) | Medium | Medium | Keyboard users can't tab behind open modals |
| 100 | Fix contrast ratios (sand-400 on sand-50) | Low | Medium | Verify WCAG AA 4.5:1 for all text |
| 101 | aria-hidden on decorative SVGs (breadcrumbs) | Low | Low | Screen readers skip decorative elements |
| 102 | aria-controls on FAQ accordion | Low | Low | Links accordion button to its content panel |
| 103 | Form validation feedback (gift cards, contact) | Medium | Low | Error messages for required fields |

## Phase 10: Performance & Cleanup (LOW — polish)

| # | Feature | Effort | Impact | Notes |
|---|---------|--------|--------|-------|
| 104 | Remove unused npm dependencies | Low | Low | mapbox-gl, react-map-gl, framer-motion, geolib, react-responsive-carousel |
| 105 | Hero image → Next.js Image component | Low | Medium | Currently CSS bg-url, bypasses optimization |
| 106 | Code-split comparison modal | Low | Low | Dynamic import for modal (not loaded until needed) |
| 107 | Move rate limiting to Redis (Upstash) | Medium | Medium | Current in-memory resets on deploy |
| 108 | Remove localhost:3000 from production origins | Low | Low | api-security.ts allows localhost in prod |
| 109 | Remove unsafe-eval from CSP | Low | Low | Tighten Content Security Policy |

## Phase 11: Competitive Edge (NICE TO HAVE — differentiators)

| # | Feature | Effort | Impact | Notes |
|---|---------|--------|--------|-------|
| 110 | Airbnb vs Direct comparison table | Medium | High | Side-by-side: fees, support, check-in, cancellation |
| 111 | Repeat guest discount / loyalty | Medium | Medium | 10% off for returning guests (localStorage or email match) |
| 112 | Seasonal promotions banner | Low | Medium | "Summer Special: 7+ nights get 15% off" — DB-driven |
| 113 | Video property tours (YouTube embed) | Low | Medium | If Noah has video content |
| 114 | Team/Noah photo on About page | Low | Low | Personal touch builds trust |
| 115 | Live chat widget (Intercom/Crisp) | Medium | Medium | Real-time support for booking questions |
| 116 | Discord + SMS notifications for service payments | Medium | Medium | Notify Noah/Jamie when services are paid |

---

## Completed (75 features)

| # | Feature | Date |
|---|---------|------|
| ✅ | Home page with hero, trust stats, featured properties, reviews | Apr 6 |
| ✅ | Properties listing with filters (Pets OK, 4+ Guests, 1+ Bedroom) + sort | Apr 6 |
| ✅ | Property detail with gallery, lightbox, amenities, description | Apr 6 |
| ✅ | Availability calendar integrated into booking card | Apr 6 |
| ✅ | Price calculator (live total based on date selection) | Apr 6 |
| ✅ | Photo carousel on property cards (prev/next arrows, dots) | Apr 6 |
| ✅ | OpenStreetMap on property detail | Apr 6 |
| ✅ | My Stay page structure (unique token link, codes, WiFi, rules) | Apr 6 |
| ✅ | Services page (airport shuttle, early check-in, pet fee, etc) | Apr 6 |
| ✅ | About page with stats from DB | Apr 6 |
| ✅ | Contact page with working form | Apr 6 |
| ✅ | Shared Layout with working mobile nav | Apr 6 |
| ✅ | Coastal Editorial design (DM Serif Display + DM Sans, sand/ocean/coral) | Apr 6 |
| ✅ | SEO meta tags (title, description, OG) + canonical URLs | Apr 6 |
| ✅ | Next.js Image optimization + ISR | Apr 6 |
| ✅ | Emoji stripping + structured description parsing | Apr 6 |
| ✅ | Review filtering (4+ stars, no host reviews, negative sentiment filtered) | Apr 6 |
| ✅ | Amenity deduplication + Show all toggle | Apr 6 |
| ✅ | Reviews per property with platform badges (Airbnb, VRBO, Booking.com) | Apr 6 |
| ✅ | Airbnb sub-ratings (cleanliness, accuracy, check-in, comms, location, value) | Apr 8 |
| ✅ | Mobile carousel arrows + sticky booking bar + lightbox close enlarged | Apr 6 |
| ✅ | Address consistency + footer rebalanced + CTA wording standardized | Apr 6 |
| ✅ | Image skeleton loading state | Apr 6 |
| ✅ | Calendar accessibility (aria-labels, aria-selected, blocked date validation) | Apr 6 |
| ✅ | Price range filter + property comparison (up to 3, modal) | Apr 6 |
| ✅ | Unified sand/ocean palette across all pages | Apr 6 |
| ✅ | Dynamic homepage stats from DB + dynamic check-in/out time | Apr 6 |
| ✅ | SVG star ratings + lightbox close button enlarged | Apr 6 |
| ✅ | Amenities dedup wrapped in useMemo | Apr 6 |
| ✅ | Stay page unified to ocean brand + emoji accessibility | Apr 6 |
| ✅ | Description decluttered (disclaimers hidden, 2 sections visible) | Apr 6 |
| ✅ | Reviews capped at 3 with "Show all" expand | Apr 6 |
| ✅ | Semi-transparent nav with backdrop blur | Apr 6 |
| ✅ | FAQ page (6 sections, 20 questions, accordion UI) | Apr 6 |
| ✅ | Photo gallery page (masonry layout, lightbox, load more) | Apr 6 |
| ✅ | Favorites/wishlist (heart icon, localStorage) | Apr 6 |
| ✅ | Recently viewed properties (localStorage, property detail) | Apr 6 |
| ✅ | Share property (native share + clipboard fallback) | Apr 6 |
| ✅ | Custom 404 page | Apr 6 |
| ✅ | sitemap.xml (dynamic) + robots.txt | Apr 6 |
| ✅ | OG image + Twitter card meta tags | Apr 6 |
| ✅ | FAQ + Gallery + Area Guide added to nav/footer | Apr 6 |
| ✅ | Graceful degradation for DB errors | Apr 6 |
| ✅ | My Stay token auto-generation on booking confirmation | Apr 6 |
| ✅ | Social proof badge ("Popular this month") on property cards | Apr 6 |
| ✅ | Nearby places grid below property map | Apr 6 |
| ✅ | Search bar on properties page (name, description, address) | Apr 6 |
| ✅ | Breadcrumbs on all inner pages | Apr 6 |
| ✅ | Area guide page (6 categories, 25+ places, distances) | Apr 6 |
| ✅ | Schema.org JSON-LD (LodgingBusiness + VacationRental + AggregateRating) | Apr 6 |
| ✅ | Floating SMS chat button on every page | Apr 6 |
| ✅ | Pricing uses actual calendar rates + "from $X/night" | Apr 6 |
| ✅ | Logo image in nav + footer | Apr 6 |
| ✅ | OG image + favicon source | Apr 6 |
| ✅ | Base prices synced to lowest available calendar rate | Apr 6 |
| ✅ | Stripe direct checkout — property bookings | Apr 8 |
| ✅ | Stripe services checkout — airport, pet fee, early check-in | Apr 8 |
| ✅ | Gift cards ($50-$500) with Stripe checkout | Apr 8 |
| ✅ | Promo codes — validate + apply Stripe promotion codes | Apr 8 |
| ✅ | Stripe webhook + idempotency guard | Apr 8 |
| ✅ | Auto-create Hostaway reservation on payment | Apr 8 |
| ✅ | Stripe SDK v22 (API version 2026-03-25.dahlia) | Apr 8 |
| ✅ | 0 npm vulnerabilities (was 15) | Apr 8 |
| ✅ | Security: PII stripping, CSP headers, rate limiting, CSRF, input validation | Apr 8 |
| ✅ | Node 20+ enforced for Railway builds | Apr 8 |
| ✅ | Compact booking card (dates + guests in one row) | Apr 8 |
| ✅ | Trust bar 4-col grid on mobile | Apr 8 |
| ✅ | Map CSP fix (OpenStreetMap in frame-src) | Apr 8 |
| ✅ | 7 code review passes — all CRITICAL + HIGH resolved | Apr 8 |
