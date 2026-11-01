import { prisma } from "./db";
export type RentalListing = {
  property_id: number;
  title: string;
  description: string;
  image_url: string;
  rental_terms: string[];
  nightly_cents: number | null;
  monthly_cents: number | null;
  city: string | null;
  state: string | null;
  bedrooms_number: number | null;
  bathrooms_number: number | null;
  person_capacity: number | null;
};
export async function rentalCatalog(): Promise<RentalListing[]> {
  // Explicit publication only: never expose all properties or private knowledge rows.
  return prisma.$queryRaw<RentalListing[]>`
 SELECT l.property_id,l.title,l.description,l.image_url,l.rental_terms,l.nightly_cents,l.monthly_cents,
 p.city,p.state,p.bedrooms_number,p.bathrooms_number,p.person_capacity
 FROM rental_listings l JOIN properties p ON p.id=l.property_id
 WHERE l.brand='precision' AND l.published=true ORDER BY p.city,l.title
 `;
}
export async function rentalListing(id: number): Promise<RentalListing | null> {
  const rows = await prisma.$queryRaw<RentalListing[]>`
 SELECT l.property_id,l.title,l.description,l.image_url,l.rental_terms,l.nightly_cents,l.monthly_cents,
 p.city,p.state,p.bedrooms_number,p.bathrooms_number,p.person_capacity
 FROM rental_listings l JOIN properties p ON p.id=l.property_id
 WHERE l.property_id=${id} AND l.brand='precision' AND l.published=true LIMIT 1
 `;
  return rows[0] || null;
}
