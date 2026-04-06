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
    images: p.listing_images ? JSON.parse(p.listing_images) : [],
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
    images: property.listing_images ? JSON.parse(property.listing_images) : [],
    amenityList: property.amenities
      ? property.amenities.split(", ").filter(Boolean)
      : [],
    knowledgeMap: Object.fromEntries(
      property.knowledge.map((k) => [k.field_name, k.field_value])
    ),
  };
}

export async function getCalendar(propertyId: number, days: number = 60) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });
  if (!property?.hostaway_property_id) return [];

  const today = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);

  return prisma.calendarDay.findMany({
    where: {
      hostaway_listing_id: property.hostaway_property_id,
      date: { gte: today, lte: end },
    },
    orderBy: { date: "asc" },
  });
}

export async function getReviews(limit: number = 10) {
  const reviews = await prisma.review.findMany({
    where: {
      rating: { gte: 4 }, // only show 4+ star reviews on marketing site
      review_content: { not: null },
      reviewer_name: { not: null },
    },
    orderBy: { submitted_at: "desc" },
    take: limit * 3, // fetch extra to filter out host reviews
  });

  // Filter out host-written reviews (templates with {{guest_name}} or generic host praise)
  return reviews
    .filter((r) => {
      const content = (r.review_content || "").toLowerCase();
      // Skip host reviews that contain template placeholders
      if (content.includes("{{guest_name}}") || content.includes("{{")) return false;
      // Skip generic host reviews about the guest
      if (content.includes("was a great guest")) return false;
      if (content.includes("respectful of the space")) return false;
      if (content.includes("recommend them to other hosts")) return false;
      if (content.includes("followed all house rules")) return false;
      if (content.includes("happy to host them again")) return false;
      if (content.includes("left the space clean")) return false;
      if (content.includes("left everything in excellent")) return false;
      return true;
    })
    .slice(0, limit);
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
  } catch {
    // Table might not exist
  }

  return {
    reservation,
    property: reservation.property,
    guest: reservation.guest,
    knowledgeMap,
    doorCode,
  };
}
