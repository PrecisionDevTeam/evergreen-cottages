import Link from "next/link";
import Layout from "../components/Layout";
import PropertyCard from "../components/PropertyCard";
import { getProperties, getReviews } from "../lib/db";
import { Property, Review } from "../types";

type Props = {
  properties: Property[];
  reviews: Review[];
};

const Home = ({ properties, reviews }: Props) => {
  return (
    <Layout description="17 professionally managed vacation rentals in Pensacola, Florida. Book direct and save 10-15%.">
      {/* Hero */}
      <section className="relative bg-evergreen-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1920&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-evergreen-900/80 to-evergreen-800/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Your Home Away<br className="hidden sm:block" />From Home
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl leading-relaxed">
            17 professionally managed vacation rentals in Pensacola, Florida.
            Minutes from the beach, NAS, and downtown.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/properties"
              className="bg-white text-evergreen-800 px-8 py-3.5 rounded-lg font-semibold text-center hover:bg-gray-100 transition-colors shadow-lg"
            >
              Browse Properties
            </Link>
            <Link
              href="/about"
              className="border-2 border-white/80 text-white px-8 py-3.5 rounded-lg font-semibold text-center hover:bg-white/10 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Why Book Direct */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Why Book Direct?</h2>
        <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
          Skip the platform fees and get the best rate when you book directly with us.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ),
              title: "Save 10-15%",
              desc: "No platform fees. Best price guaranteed when you book directly with us.",
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              ),
              title: "24/7 Personal Service",
              desc: "Direct contact with our local team. Call or text anytime for anything you need.",
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              ),
              title: "Flexible & Secure",
              desc: "Smart lock entry, easy extensions, airport shuttle, and add-on services.",
            },
          ].map((item) => (
            <div key={item.title} className="text-center p-8 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-evergreen-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-evergreen-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Our Properties</h2>
              <p className="text-gray-500 mt-1">{properties.length} rentals in Pensacola, FL</p>
            </div>
            <Link href="/properties" className="text-evergreen-600 font-medium hover:text-evergreen-700 transition-colors hidden sm:block">
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.slice(0, 8).map((property, i) => (
              <PropertyCard key={property.id} property={property} priority={i < 4} />
            ))}
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link href="/properties" className="text-evergreen-600 font-medium">
              View all {properties.length} properties &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">What Our Guests Say</h2>
          <p className="text-gray-500 text-center mb-12">Real reviews from real guests</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((review) => (
              <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="text-yellow-400 text-sm tracking-wide">
                    {"★".repeat(Math.round(review.rating || 5))}
                  </div>
                  <span className="ml-2 text-sm text-gray-400">{review.rating}/5</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed italic">
                  &ldquo;{review.review_content}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {review.reviewer_name || "Guest"}
                  </p>
                  {review.submitted_at && (
                    <p className="text-xs text-gray-400">
                      {new Date(review.submitted_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services CTA */}
      <section className="bg-evergreen-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Add-on Services</h2>
          <p className="text-evergreen-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Airport pickup &amp; drop-off, early check-in, late checkout, pet accommodations, and more.
          </p>
          <Link
            href="/services"
            className="inline-block bg-white text-evergreen-700 px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            View Services
          </Link>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Book?</h2>
        <p className="text-gray-500 mb-8 max-w-xl mx-auto">
          Have questions? Call or text us anytime. We&apos;re here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="tel:+15108227060"
            className="bg-evergreen-600 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-evergreen-700 transition-colors"
          >
            Call (510) 822-7060
          </a>
          <Link
            href="/contact"
            className="border-2 border-gray-300 text-gray-700 px-8 py-3.5 rounded-lg font-semibold hover:border-gray-400 transition-colors"
          >
            Send a Message
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Home;

export const getStaticProps = async () => {
  const properties = await getProperties("Pensacola");
  const reviews = await getReviews(6);

  return {
    props: {
      properties: JSON.parse(JSON.stringify(properties)),
      reviews: JSON.parse(JSON.stringify(reviews)),
    },
    revalidate: 3600, // ISR: rebuild every hour
  };
};
