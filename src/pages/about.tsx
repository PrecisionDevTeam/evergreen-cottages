import Layout from "../components/Layout";
import { getReviews } from "../lib/db";

type Props = { reviewCount: number; avgRating: number };

const About = ({ reviewCount, avgRating }: Props) => {
  return (
    <Layout title="About" description="Learn about Evergreen Cottages — 17 vacation rentals in Pensacola, FL.">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About Evergreen Cottages</h1>

        <div className="text-gray-600 space-y-5 leading-relaxed">
          <p>
            Evergreen Cottages is a collection of 17 professionally managed vacation rentals
            located at 3801 Mobile Highway in Pensacola, Florida. We offer comfortable,
            affordable accommodations just minutes from Pensacola Beach, NAS Pensacola,
            and downtown.
          </p>
          <p>
            Each unit is individually designed with everything you need — fully equipped
            kitchens, air conditioning, WiFi, washer/dryer, free parking, and smart lock entry.
            Most units welcome pets.
          </p>
          <p>
            Whether you&apos;re visiting for work, vacation, military duty, or just passing
            through, our on-site management team is available 24/7 by phone or text.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14">
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-evergreen-700">17</div>
            <div className="text-sm text-gray-500 mt-1">Units</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-evergreen-700">{avgRating.toFixed(1)}</div>
            <div className="text-sm text-gray-500 mt-1">Avg Rating</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-evergreen-700">{reviewCount.toLocaleString()}+</div>
            <div className="text-sm text-gray-500 mt-1">Reviews</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-evergreen-700">24/7</div>
            <div className="text-sm text-gray-500 mt-1">Support</div>
          </div>
        </div>

        <div className="mt-14 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-4">Location</h2>
          <p className="text-gray-600 mb-2">3801 Mobile Highway, Pensacola, FL 32505</p>
          <p className="text-gray-500 text-sm">
            Minutes from Pensacola Beach, NAS Pensacola, Downtown Pensacola,
            and Pensacola International Airport.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;

export const getStaticProps = async () => {
  const reviews = await getReviews(999);
  const rated = reviews.filter((r) => r.rating);
  const avgRating = rated.length > 0
    ? rated.reduce((sum, r) => sum + (r.rating || 0), 0) / rated.length
    : 4.9;

  return {
    props: { reviewCount: reviews.length, avgRating },
    revalidate: 86400,
  };
};
