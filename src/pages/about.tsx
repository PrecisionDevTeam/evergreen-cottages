import Layout from "../components/Layout";
import Breadcrumbs from "../components/Breadcrumbs";

type Props = { reviewCount: number; avgRating: number };

export default function About({ reviewCount, avgRating }: Props) {
  return (
    <Layout title="About" description="17 vacation rentals in Pensacola, FL. Learn about Evergreen Cottages.">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 py-20">
        <Breadcrumbs items={[{ label: "About" }]} />
        <p className="text-coral-500 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Our Story</p>
        <h1 className="text-4xl md:text-5xl font-serif text-ocean-500 mb-8">About Evergreen Cottages</h1>

        <div className="text-sand-600 space-y-5 leading-relaxed text-lg">
          <p>
            Evergreen Cottages is a collection of 17 professionally managed vacation rentals
            at 3801 Mobile Highway in Pensacola, Florida.
          </p>
          <p>
            Each unit comes with a fully equipped kitchen, air conditioning, WiFi, washer/dryer,
            free parking, and smart lock entry. Most units welcome pets.
          </p>
          <p>
            Our on-site team is available 24/7 by phone or text. Whether you&apos;re here for work,
            vacation, or military duty — we&apos;re here to help.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { val: "17", label: "Units" },
            { val: avgRating.toFixed(1), label: "Avg Rating" },
            { val: `${reviewCount.toLocaleString()}+`, label: "Reviews" },
            { val: "24/7", label: "Support" },
          ].map((s) => (
            <div key={s.label} className="text-center bg-white rounded-2xl p-6 border border-sand-100">
              <div className="text-3xl font-serif text-ocean-500">{s.val}</div>
              <div className="text-xs text-sand-500 uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-2xl p-8 border border-sand-100">
          <h2 className="text-xl font-serif text-ocean-500 mb-3">Location</h2>
          <p className="text-sand-600">3801 Mobile Highway, Pensacola, FL 32505</p>
          <p className="text-sand-500 text-sm mt-1">Minutes from the beach, NAS, and downtown.</p>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps = async () => {
  const { prisma } = await import("../lib/db");
  const stats = await prisma.review.aggregate({
    _avg: { rating: true },
    _count: { id: true },
    where: { rating: { not: null }, review_content: { not: null } },
  });
  return {
    props: {
      reviewCount: stats._count.id || 0,
      avgRating: stats._avg.rating || 4.9,
    },
    revalidate: 86400,
  };
};
