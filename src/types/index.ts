export type Property = {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  lat: number | null;
  lng: number | null;
  hostaway_property_id: string | null;
  person_capacity: number | null;
  bedrooms_number: number | null;
  bathrooms_number: number | null;
  base_price: number | null;
  cleaning_fee: number | null;
  check_in_time: number | null;
  check_out_time: number | null;
  bathroom_type: string | null;
  pets_allowed: boolean | null;
  description: string | null;
  images: string[];
  amenityList: string[];
};

export type Review = {
  id: number;
  reviewer_name: string | null;
  rating: number | null;
  review_content: string | null;
  submitted_at: string | null;
  check_out_date: string | null;
  hostaway_listing_id: string | null;
};

export type CalendarDay = {
  id: number;
  date: string;
  is_available: number | null;
  price: number | null;
};

export type StayData = {
  reservation: any;
  property: any;
  guest: any;
  knowledgeMap: Record<string, string | null>;
  doorCode: string | null;
};
