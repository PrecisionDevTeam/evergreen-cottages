import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function getRecentBookingCounts(): Promise<Record<number, number>> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const counts = await prisma.reservation.groupBy({
    by: ["property_id"],
    where: {
      check_in: { gte: monthStart, lte: monthEnd },
      status: { in: ["confirmed", "checked_in", "checked_out"] },
      property_id: { not: null },
      property: { city: "Pensacola" },
    },
    _count: { id: true },
  });

  const map: Record<number, number> = {};
  for (const row of counts) {
    if (row.property_id) {
      map[row.property_id] = row._count.id;
    }
  }
  return map;
}

export async function getProperties(city?: string) {
  const where = city ? { city } : {};
  const properties = await prisma.property.findMany({
    where,
    orderBy: { name: "asc" },
  });
  return properties.map((p) => ({
    ...p,
    images: (() => { try { return p.listing_images ? JSON.parse(p.listing_images) : []; } catch { return []; } })(),
    amenityList: p.amenities ? p.amenities.split(", ").filter(Boolean) : [],
  }));
}

export async function getProperty(id: number) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      knowledge: true,
    },
  });
  if (!property) return null;
  return {
    ...property,
    images: (() => { try { return property.listing_images ? JSON.parse(property.listing_images) : []; } catch { return []; } })(),
    amenityList: property.amenities
      ? property.amenities.split(", ").filter(Boolean)
      : [],
    knowledgeMap: Object.fromEntries(
      property.knowledge.map((k) => [k.field_name, k.field_value])
    ),
  };
}

export async function getCalendar(hostawayListingId: string | null, days: number = 60) {
  if (!hostawayListingId) return [];

  const today = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);

  return prisma.calendarDay.findMany({
    where: {
      hostaway_listing_id: hostawayListingId,
      date: { gte: today, lte: end },
    },
    orderBy: { date: "asc" },
  });
}

const HOST_REVIEW_PHRASES = [
  "was a great guest", "respectful of the space", "recommend them to other hosts",
  "followed all house rules", "happy to host them again", "left the space clean",
  "left everything in excellent", "{{",
];

// Multi-word phrases use substring match; single words use word-boundary regex
// to avoid false positives like "smelled like fresh flowers"
const NEGATIVE_PHRASES_EXACT = [
  "not clean", "wasn't clean", "halfway cleaned", "wasn't cleaned",
  "didn't feel safe", "wouldn't recommend", "would not recommend",
  "don't recommend", "do not recommend", "not worth", "waste of money",
  "rip off", "nothing special", "super cheap", "not what we expected",
  "no response", "didn't work", "doesn't work", "not working", "out of order",
  "couldn't sleep", "bed bugs", "never again", "never staying",
  "never coming back", "never return", "not a fan", "wasn't a fan",
];

const NEGATIVE_WORDS_BOUNDARY = [
  "ants", "bugs", "cockroach", "roach", "mice", "mouse", "rat",
  "dirty", "filthy", "disgusting", "gross", "mold", "mildew",
  "unsafe", "sketchy", "dangerous", "scary", "ripoff", "scam",
  "inconsiderate", "rude", "unprofessional", "unresponsive",
  "broken", "stink", "stunk", "odor", "noisy", "bedbug",
  "worst", "terrible", "horrible", "awful", "nightmare",
  "disappointed", "disappointing", "uncomfortable",
];

const negativeWordPatterns = NEGATIVE_WORDS_BOUNDARY.map(
  (w) => new RegExp(`\\b${w}\\b`, "i")
);

function isGuestReview(r: { review_content: string | null }): boolean {
  const content = (r.review_content || "").toLowerCase();
  if (!content || content.length < 5) return false;
  if (HOST_REVIEW_PHRASES.some((phrase) => content.includes(phrase))) return false;
  if (NEGATIVE_PHRASES_EXACT.some((phrase) => content.includes(phrase))) return false;
  if (negativeWordPatterns.some((pattern) => pattern.test(content))) return false;
  return true;
}

export async function getReviews(limit: number = 10) {
  const reviews = await prisma.review.findMany({
    where: {
      rating: { gte: 4 },
      review_content: { not: null },
      reviewer_name: { not: null },
    },
    orderBy: { submitted_at: "desc" },
    take: limit * 3,
  });

  return reviews.filter(isGuestReview).slice(0, limit);
}

export async function getPropertyReviews(hostawayListingId: string | null, limit: number = 10) {
  if (!hostawayListingId) return [];

  const reviews = await prisma.review.findMany({
    where: {
      hostaway_listing_id: hostawayListingId,
      rating: { gte: 4 },
      review_content: { not: null },
      reviewer_name: { not: null },
    },
    orderBy: { submitted_at: "desc" },
    take: limit * 3,
  });

  return reviews.filter(isGuestReview).slice(0, limit);
}

export async function getStayByToken(token: string) {
  const stayToken = await prisma.stayToken.findUnique({
    where: { token },
  });
  if (!stayToken) return null;

  // Check expiry
  if (stayToken.expires_at && stayToken.expires_at < new Date()) return null;

  const reservation = await prisma.reservation.findUnique({
    where: { id: stayToken.reservation_id },
    include: {
      property: { include: { knowledge: true } },
      guest: true,
    },
  });
  if (!reservation) return null;

  const knowledgeMap = Object.fromEntries(
    (reservation.property?.knowledge || []).map((k) => [
      k.field_name,
      k.field_value,
    ])
  );

  // Get door code if exists
  let doorCode = null;
  try {
    const result = await prisma.$queryRaw<{ code: string }[]>`
      SELECT code FROM seam_access_codes
      WHERE reservation_id = ${stayToken.reservation_id}
        AND status = 'active'
      LIMIT 1
    `;
    doorCode = typeof result[0]?.code === "string" ? result[0].code : null;
  } catch (err) {
    // seam_access_codes query failed — door code unavailable
  }

  return {
    reservation,
    property: reservation.property,
    guest: reservation.guest,
    knowledgeMap,
    doorCode,
  };
}
