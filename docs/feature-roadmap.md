# Evergreen Cottages Website — Feature Roadmap

**Last updated:** April 6, 2026

## Must-Have Before Launch

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Mobile swipe on photos | NOT STARTED | Touch gestures for property card carousel + detail gallery |
| 2 | FAQ section | NOT STARTED | Parking, WiFi, pets, check-in, checkout, smart lock, gate code |
| 3 | Reviews per property | NOT STARTED | Show unit-specific reviews on detail page (match by listing ID) |
| 4 | Sitemap.xml + robots.txt | NOT STARTED | For Google indexing |
| 5 | 404 page | NOT STARTED | Custom not-found page instead of default Next.js error |
| 6 | My Stay page working | NOT STARTED | Generate stay_tokens in hostaway-data-hub on booking confirmation |

## Good to Have

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 7 | Property comparison | NOT STARTED | Compare 2-3 units side by side (capacity, price, amenities) |
| 8 | Photo fullscreen on mobile | NOT STARTED | Swipe through all photos in fullscreen mode |
| 9 | Guest count on cards | NOT STARTED | "Booked 3 times this week" — social proof |
| 10 | Nearby places on map | NOT STARTED | Restaurants, beach, NAS, airport markers on property map |
| 11 | Search bar | NOT STARTED | Search by date range, guests, pet-friendly |
| 12 | Breadcrumbs | NOT STARTED | Home > Properties > Unit 17 |
| 13 | Share button | NOT STARTED | Share property link via text, email, copy link |
| 14 | Favorites/wishlist | NOT STARTED | Save properties to favorites (localStorage, no login) |

## Revenue Features (Needs Stripe Keys)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 15 | Direct checkout | BLOCKED | Full booking + Stripe payment on site. Needs sk_live/sk_test. |
| 16 | Services checkout | BLOCKED | Pay for airport pickup, pet fee, extension, early check-in online |
| 17 | Gift cards | NOT STARTED | Buy a stay as a gift |
| 18 | Promo codes | NOT STARTED | Discount codes for direct bookings |

## SEO & Marketing

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 19 | Blog / area guide | NOT STARTED | "Top 10 things to do in Pensacola", "Best beaches near NAS" |
| 20 | Google Analytics + Meta Pixel | NOT STARTED | Track traffic, conversions, ad performance |
| 21 | OpenGraph images | NOT STARTED | Property photo as social share preview on Facebook/iMessage |
| 22 | Schema.org markup | NOT STARTED | Rich snippets in Google search results (price, rating, availability) |

## Completed

| # | Feature | Date |
|---|---------|------|
| ✅ | Home page with hero, trust stats, featured properties, reviews | Apr 6 |
| ✅ | Properties listing with filters (Pets OK, 4+ Guests, 1+ Bedroom) + sort | Apr 6 |
| ✅ | Property detail with gallery, lightbox, amenities, description | Apr 6 |
| ✅ | Availability calendar integrated into booking card | Apr 6 |
| ✅ | Price calculator (live total based on date selection) | Apr 6 |
| ✅ | Book Now sends pre-filled email with dates, guests, total | Apr 6 |
| ✅ | Photo carousel on property cards (prev/next arrows, dots) | Apr 6 |
| ✅ | OpenStreetMap on property detail | Apr 6 |
| ✅ | My Stay page structure (unique token link, codes, WiFi, rules) | Apr 6 |
| ✅ | Services page (airport shuttle, early check-in, pet fee, etc) | Apr 6 |
| ✅ | About page with stats from DB | Apr 6 |
| ✅ | Contact page with working form | Apr 6 |
| ✅ | Shared Layout with working mobile nav | Apr 6 |
| ✅ | Coastal Editorial design (DM Serif Display + DM Sans, sand/ocean/coral) | Apr 6 |
| ✅ | SEO meta tags (title, description, OG) | Apr 6 |
| ✅ | Next.js Image optimization | Apr 6 |
| ✅ | ISR (hourly revalidation) on listing pages | Apr 6 |
| ✅ | Emoji stripping from descriptions | Apr 6 |
| ✅ | Structured description parsing (sections + bullet lists) | Apr 6 |
| ✅ | Review filtering (4+ stars only, no host reviews, no empty) | Apr 6 |
| ✅ | Amenity deduplication + Show all toggle | Apr 6 |
| ✅ | Code review — 2 CRITICAL + 6 HIGH issues resolved | Apr 6 |
