import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

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

const NEGATIVE_PHRASES = [
  "ants", "bugs", "cockroach", "roach", "mice", "mouse", "rat",
  "dirty", "filthy", "disgusting", "gross", "mold", "mildew", "stain",
  "not clean", "wasn't clean", "halfway cleaned", "wasn't cleaned",
  "didn't feel safe", "unsafe", "sketchy", "dangerous", "scary",
  "wouldn't recommend", "would not recommend", "don't recommend", "do not recommend",
  "not worth", "waste of money", "rip off", "ripoff", "scam",
  "nothing special", "super cheap", "not what we expected",
  "inconsiderate", "rude", "unprofessional", "unresponsive", "no response",
  "broken", "didn't work", "doesn't work", "not working", "out of order",
  "smell", "smelled", "stink", "stunk", "odor",
  "noisy", "loud", "noise", "couldn't sleep",
  "bed bugs", "bedbug",
  "worst", "terrible", "horrible", "awful", "nightmare",
  "never again", "never staying", "never coming back", "never return",
  "not a fan", "wasn't a fan", "disappointed", "disappointing",
  "uncomfortable", "uncomfy",
];

function isGuestReview(r: { review_content: string | null }): boolean {
  const content = (r.review_content || "").toLowerCase();
  if (!content || content.length < 5) return false;
  if (HOST_REVIEW_PHRASES.some((phrase) => content.includes(phrase))) return false;
  if (NEGATIVE_PHRASES.some((phrase) => content.includes(phrase))) return false;
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
    doorCode = result[0]?.code || null;
  } catch (err) {
    console.error("seam_access_codes query failed:", err);
  }

  return {
    reservation,
    property: reservation.property,
    guest: reservation.guest,
    knowledgeMap,
    doorCode,
  };
}
