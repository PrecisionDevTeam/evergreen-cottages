import Head from "next/head";
import Link from "next/link";
import { getProperties, getReviews } from "../lib/db";

type Property = {
  id: number;
  name: string;
  person_capacity: number | null;
  bedrooms_number: number | null;
  bathrooms_number: number | null;
  base_price: number | null;
  cleaning_fee: number | null;
  pets_allowed: boolean | null;
  images: string[];
  amenityList: string[];
  description: string | null;
};

type Review = {
  id: number;
  reviewer_name: string | null;
  rating: number | null;
  review_content: string | null;
};

type Props = {
  properties: Property[];
  reviews: Review[];
};

const Home = ({ properties, reviews }: Props) => {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Evergreen Cottages — Vacation Rentals in Pensacola, FL</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-evergreen-700">
              Evergreen Cottages
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/properties" className="text-gray-600 hover:text-evergreen-700 text-sm font-medium">Properties</Link>
              <Link href="/services" className="text-gray-600 hover:text-evergreen-700 text-sm font-medium">Services</Link>
              <Link href="/about" className="text-gray-600 hover:text-evergreen-700 text-sm font-medium">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-evergreen-700 text-sm font-medium">Contact</Link>
              <Link href="/properties" className="bg-evergreen-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-evergreen-700">
                Book Direct
              </Link>
            </div>
            <button className="md:hidden text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-evergreen-800 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-evergreen-900/90 to-evergreen-700/70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Your Home Away<br />From Home
          </h1>
          <p className="text-lg md:text-xl text-evergreen-100 mb-8 max-w-xl">
            17 professionally managed vacation rentals in Pensacola, Florida. Minutes from the beach, NAS, and downtown.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/properties" className="bg-white text-evergreen-800 px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-100">
              Browse Properties
            </Link>
            <Link href="/about" className="border border-white text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-white/10">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Why Book Direct */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Book Direct?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-evergreen-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-evergreen-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Save 10-15%</h3>
            <p className="text-gray-500">No platform fees. Best price guaranteed when you book directly with us.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-evergreen-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-evergreen-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Personal Service</h3>
            <p className="text-gray-500">Direct contact with our team. Call or text 24/7 for anything you need.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-evergreen-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-evergreen-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Flexible & Secure</h3>
            <p className="text-gray-500">Easy check-in with smart locks. Extend your stay or add services anytime.</p>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Our Properties</h2>
            <Link href="/properties" className="text-evergreen-600 font-medium hover:text-evergreen-700">
              View all {properties.length} &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.slice(0, 8).map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] bg-gray-200 relative">
                  {property.images[0] && (
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {property.pets_allowed && (
                    <span className="absolute top-3 left-3 bg-evergreen-600 text-white text-xs px-2 py-1 rounded-full">
                      Pets OK
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{property.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span>{property.person_capacity || 2} guests</span>
                    <span className="mx-1">&middot;</span>
                    <span>{property.bathrooms_number || 1} bath</span>
                    {property.bedrooms_number ? (
                      <>
                        <span className="mx-1">&middot;</span>
                        <span>{property.bedrooms_number} bed</span>
                      </>
                    ) : null}
                  </div>
                  <p className="text-evergreen-700 font-semibold">
                    From ${property.base_price || 65}/night
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">What Our Guests Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((review) => (
              <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <div className="text-yellow-400 text-sm">
                    {"★".repeat(Math.round(review.rating || 5))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">{review.rating}/5</span>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  &ldquo;{review.review_content}&rdquo;
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {review.reviewer_name || "Guest"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services CTA */}
      <section className="bg-evergreen-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Add-on Services</h2>
          <p className="text-evergreen-100 mb-8 max-w-2xl mx-auto">
            Airport pickup & drop-off, early check-in, late checkout, pet accommodations, and more.
          </p>
          <Link href="/services" className="bg-white text-evergreen-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
            View Services
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Evergreen Cottages</h3>
              <p className="text-sm">3801 Mobile Highway<br />Pensacola, FL 32505</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <p className="text-sm">(510) 822-7060</p>
              <p className="text-sm">hello@staywithprecision.com</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <div className="flex flex-col space-y-2 text-sm">
                <Link href="/properties" className="hover:text-white">Properties</Link>
                <Link href="/services" className="hover:text-white">Services</Link>
                <Link href="/about" className="hover:text-white">About Us</Link>
                <Link href="/contact" className="hover:text-white">Contact</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            &copy; {new Date().getFullYear()} Evergreen Cottages. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

export const getServerSideProps = async () => {
  const properties = await getProperties("Pensacola");
  const reviews = await getReviews(6);

  return {
    props: {
      properties: JSON.parse(JSON.stringify(properties)),
      reviews: JSON.parse(JSON.stringify(reviews)),
    },
  };
};
