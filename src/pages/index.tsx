import Link from "next/link";
import Layout from "../components/Layout";
import PropertyCard from "../components/PropertyCard";
import { getPropertiesWithOverrides, getReviews } from "../lib/db";
import { Property, Review } from "../types";

type Props = {
  properties: Property[];
  reviews: Review[];
  reviewCount: number;
  avgRating: number;
};

const Home = ({ properties, reviews, reviewCount, avgRating }: Props) => {
  return (
    <Layout
      dark
      description="17 professionally managed vacation rentals in Pensacola, Florida. Book direct and save 10-15%."
      schema={{
        "@context": "https://schema.org",
        "@type": "LodgingBusiness",
        name: "Evergreen Cottages",
        description: "17 professionally managed vacation rentals in Pensacola, Florida.",
        address: {
          "@type": "PostalAddress",
          streetAddress: "3801 Mobile Highway",
          addressLocality: "Pensacola",
          addressRegion: "FL",
          postalCode: "32505",
          addressCountry: "US",
        },
        telephone: "+15108227060",
        email: "hello@staywithprecision.com",
        url: "https://evergreencottages.com",
        priceRange: "$$",
        ...(reviewCount > 0 ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount,
            bestRating: 5,
          },
        } : {}),
        numberOfRooms: properties.length,
        petsAllowed: true,
      }}
    >
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${properties[0]?.images?.[0] || '/images/og-image.png'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ocean-900/95 via-ocean-800/85 to-ocean-700/70" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-32">
          <div className="max-w-2xl">
            <p className="text-coral-400 text-sm uppercase tracking-[0.2em] font-semibold mb-4 fade-in">
              Pensacola, Florida
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white leading-[1.1] mb-6 fade-in-up">
              Pensacola Beach<br />Vacation Rentals
            </h1>
            <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-lg fade-in-up" style={{ animationDelay: '0.15s' }}>
              17 professionally managed cottages, minutes from the beach.
              Book direct and save 10-15% vs Airbnb — no platform fees.
            </p>
            {/* Quick search */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 max-w-xl fade-in-up" style={{ animationDelay: '0.25s' }}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/properties"
                  className="flex-1 bg-white text-ocean-600 px-6 py-3.5 rounded-xl font-semibold text-center hover:bg-sand-100 transition-all shadow-lg text-sm"
                >
                  Browse All {properties.length} Properties
                </Link>
                <a
                  href="tel:+15108227060"
                  className="px-6 py-3.5 rounded-xl font-semibold text-center text-white border border-white/40 hover:bg-white/10 transition-all text-sm"
                >
                  Call (510) 822-7060
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative bottom curve */}
        <div className="absolute bottom-0 w-full">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="#faf8f5" />
          </svg>
        </div>
      </section>

      {/* Trust bar */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 -mt-2 mb-16">
        <div className="grid grid-cols-4 text-center py-6 gap-2">
          <div>
            <div className="text-2xl sm:text-3xl font-serif text-ocean-500">{properties.length}</div>
            <div className="text-[10px] sm:text-xs text-sand-500 uppercase tracking-widest mt-0.5">Properties</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif text-ocean-500">{avgRating.toFixed(1)}</div>
            <div className="text-[10px] sm:text-xs text-sand-500 uppercase tracking-widest mt-0.5">Avg Rating</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif text-ocean-500">{reviewCount.toLocaleString()}+</div>
            <div className="text-[10px] sm:text-xs text-sand-500 uppercase tracking-widest mt-0.5">Reviews</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif text-ocean-500">24/7</div>
            <div className="text-[10px] sm:text-xs text-sand-500 uppercase tracking-widest mt-0.5">Support</div>
          </div>
        </div>
      </section>

      {/* Why Book Direct */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-serif text-ocean-500 mb-3">Why Book Direct?</h2>
          <p className="text-sand-500 max-w-lg mx-auto">
            Skip the middleman. Get the best rate and personal service.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              label: "Save",
              value: "10-15%",
              desc: "No Airbnb or VRBO fees. Best price guaranteed when you book directly with us.",
            },
            {
              label: "Direct",
              value: "Contact",
              desc: "Talk to our local Pensacola team. Call or text 24/7. No chatbots, real people.",
            },
            {
              label: "Smart",
              value: "Entry",
              desc: "Keyless smart lock entry. Your door code sent before arrival. Extend anytime.",
            },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-8 text-center card-lift border border-sand-100">
              <div className="text-xs text-coral-500 uppercase tracking-[0.2em] font-semibold mb-2">
                {item.label}
              </div>
              <div className="text-3xl font-serif text-ocean-500 mb-3">{item.value}</div>
              <p className="text-sand-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12">
            <div>
              <p className="text-coral-500 text-xs uppercase tracking-[0.2em] font-semibold mb-2">Featured</p>
              <h2 className="text-4xl md:text-5xl font-serif text-ocean-500">Our Properties</h2>
            </div>
            <Link href="/properties" className="text-ocean-500 font-medium hover:text-coral-500 transition-colors mt-4 sm:mt-0 group">
              View all {properties.length}
              <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 stagger">
            {properties.slice(0, 8).map((property, i) => (
              <PropertyCard key={property.id} property={property} priority={i < 4} />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="py-24 bg-sand-50">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
            <div className="text-center mb-14">
              <p className="text-coral-500 text-xs uppercase tracking-[0.2em] font-semibold mb-2">Testimonials</p>
              <h2 className="text-4xl md:text-5xl font-serif text-ocean-500">What Guests Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger">
              {reviews.slice(0, 6).map((review) => (
                <div key={review.id} className="bg-white rounded-2xl p-7 card-lift border border-sand-100 fade-in-up">
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.round(review.rating || 5) ? "text-yellow-400" : "text-sand-200"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-ocean-600 text-sm leading-relaxed mb-5 line-clamp-4 italic">
                    &ldquo;{review.review_content}&rdquo;
                  </p>
                  <div className="flex items-center justify-between border-t border-sand-100 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ocean-500">
                        {review.reviewer_name || "Guest"}
                      </span>
                      {review.channel_id && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sand-100 text-sand-500 font-medium">
                          {review.channel_id === 2018 ? "Airbnb" : review.channel_id === 2005 ? "Booking.com" : review.channel_id === 2002 ? "VRBO" : "Direct"}
                        </span>
                      )}
                    </div>
                    {review.submitted_at && (
                      <span className="text-xs text-sand-400">
                        {new Date(review.submitted_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services CTA */}
      <section className="py-24 border-t border-sand-200">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 lg:px-10 text-center">
          <p className="text-coral-500 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Extras</p>
          <h2 className="text-4xl md:text-5xl font-serif text-ocean-500 mb-5">Add-on Services</h2>
          <p className="text-sand-500 mb-10 leading-relaxed">
            Airport shuttle, early check-in, late checkout, pet accommodations, and more.
          </p>
          <Link
            href="/services"
            className="inline-block bg-ocean-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-ocean-600 transition-all shadow-lg"
          >
            View Services
          </Link>
        </div>
      </section>

    </Layout>
  );
};

export default Home;

export const getServerSideProps = async () => {
  const { prisma } = await import("../lib/db");
  const [properties, reviews, stats] = await Promise.all([
    getPropertiesWithOverrides("Pensacola"),
    getReviews(6),
    prisma.review.aggregate({
      _avg: { rating: true },
      _count: { id: true },
      where: { rating: { not: null }, review_content: { not: null } },
    }),
  ]);

  return {
    props: {
      properties: JSON.parse(JSON.stringify(
        properties.map((p: any) => ({
          ...p,
          images: p.images.slice(0, 8),
          description: null,
          listing_images: undefined,
          amenities: undefined,
        }))
      )),
      reviews: JSON.parse(JSON.stringify(reviews)),
      reviewCount: stats._count.id || 0,
      avgRating: stats._avg.rating || 4.9,
    },
  };
};
