# Extension checkout continuation

The existing signed-token extension checkout is retained. It now validates the source reservation guest, active status and exact checkout date before Stripe session creation. Source lookup failure returns 503 instead of continuing with incomplete identity/property data. A new reservation is still created through the existing Stripe webhook; extension metadata's guest name takes precedence over a payer's different billing name.

Run `node --test tests/extension-checkout.test.cjs` after installing development dependencies. Tests transpile the actual endpoint and mock Stripe, Prisma, origin checks and network calls. They do not charge a card or create a reservation. Full build/CI and supervised production payment/webhook verification remain required. Same-unit checkout's existing cached availability behavior remains unchanged and requires provider validation before activation.

Deploy together with the data-hub cleaning reconciliation and cleaning-app regeneration guard. Do not treat a successful Stripe payment alone as a verified Hostaway reservation or cleaner notification.
