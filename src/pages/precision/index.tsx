import Link from "next/link";
import PrecisionLayout, {
  precisionBase,
  portalUrl,
} from "../../components/PrecisionLayout";
import RentalCard from "../../components/RentalCard";
import { rentalCatalog, RentalListing } from "../../lib/rental-catalog";
export default function PrecisionHome({
  listings,
}: {
  listings: RentalListing[];
}) {
  const cover = listings.find((l) => l.image_url)?.image_url;
  return (
    <PrecisionLayout dark>
      <section className="relative min-h-[720px] flex items-end bg-ocean-700 text-white overflow-hidden">
        {cover && (
          <img
            src={cover}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-ocean-700 via-ocean-700/70 to-ocean-700/10" />
        <div className="absolute -right-24 -top-32 w-[700px] h-[900px] rounded-full border border-white/10 rotate-45" />
        <div className="relative max-w-7xl mx-auto w-full px-6 lg:px-10 pt-44 pb-20">
          <p className="text-xs uppercase tracking-[0.3em] text-white/65 mb-6">
            A weekend. A season. A place to call home.
          </p>
          <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl max-w-3xl leading-[1.05]">
            Find your place.
            <br />
            <span className="italic text-sand-200">Stay a little.</span>
          </h1>
          <p className="max-w-lg text-white/75 mt-7 text-lg leading-relaxed">
            Comfortable homes and a team that knows you. Discover a stay that
            fits the way you live.
          </p>
          <div className="flex gap-4 flex-wrap mt-10">
            <Link
              href={precisionBase + "/properties"}
              className="bg-sand-50 text-ocean-700 rounded-full px-7 py-4 font-semibold"
            >
              Explore our homes ↗
            </Link>
            <a
              href="#ways-to-stay"
              className="border border-white/40 rounded-full px-7 py-4"
            >
              Find your kind of stay
            </a>
          </div>
          <div className="mt-14 pt-6 border-t border-white/20 text-xs uppercase tracking-widest text-white/60 flex gap-8 flex-wrap">
            <span>Short stays</span>
            <span>Extended stays</span>
            <span>Long term homes</span>
          </div>
        </div>
      </section>
      <section
        id="ways-to-stay"
        className="max-w-7xl mx-auto px-6 lg:px-10 py-24"
      >
        <p className="text-coral-500 uppercase text-xs tracking-[0.25em] mb-4">
          Room for every chapter
        </p>
        <div className="grid md:grid-cols-2 gap-8 mb-14">
          <h2 className="text-5xl font-serif leading-tight">
            Life moves.
            <br />
            Feel at home.
          </h2>
          <p className="text-sand-500 text-lg leading-relaxed max-w-md">
            A quick getaway, a work assignment, or somewhere to put down roots.
            Start with the stay you need, and we'll help with the rest.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              key: "short",
              n: "01",
              title: "A little escape",
              desc: "A few nights away. Space to relax and make yourself comfortable.",
            },
            {
              key: "mid",
              n: "02",
              title: "Settle in for a while",
              desc: "Here for work, a transition, or an extended visit? Find a home for the in-between.",
            },
            {
              key: "long",
              n: "03",
              title: "Your next home",
              desc: "Find your everyday place, with a management team you can reach.",
            },
          ].map((t) => (
            <Link
              key={t.key}
              href={precisionBase + "/properties?term=" + t.key}
              className="border border-sand-200 rounded-2xl p-8 hover:bg-white transition-colors"
            >
              <span className="text-coral-500 text-xs">
                {t.n} / {t.key.toUpperCase()} TERM
              </span>
              <h3 className="font-serif text-3xl mt-8 mb-4">{t.title}</h3>
              <p className="text-sand-500 text-sm leading-relaxed min-h-20">
                {t.desc}
              </p>
              <p className="mt-8 text-sm font-semibold">Explore homes ↗</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-white border-y border-sand-200 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex justify-between items-end mb-12 gap-4">
            <div>
              <p className="text-coral-500 uppercase text-xs tracking-widest mb-4">
                The collection
              </p>
              <h2 className="font-serif text-5xl">Find your home base.</h2>
            </div>
            <Link
              href={precisionBase + "/properties"}
              className="text-sm underline"
            >
              View all homes ↗
            </Link>
          </div>
          {listings.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.slice(0, 6).map((l) => (
                <RentalCard key={l.property_id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="bg-sand-50 border rounded-2xl p-10">
              <h3 className="font-serif text-3xl mb-3">
                Let's find the right fit.
              </h3>
              <p className="text-sand-500 mb-5">
                We're preparing our rental collection. Contact our team for
                current homes and availability.
              </p>
              <a
                className="underline"
                href="mailto:hello@staywithprecision.com"
              >
                Talk to Precision ↗
              </a>
            </div>
          )}
        </div>
      </section>
      <section className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 px-6 lg:px-10 py-24">
        <div className="bg-ocean-700 text-white rounded-2xl p-10 lg:p-14">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Our Pensacola collection
          </p>
          <h2 className="font-serif text-4xl mt-8 mb-5">
            A coastal state of mind.
          </h2>
          <p className="text-white/70 mb-10">
            Discover Evergreen Cottages, our dedicated collection in Pensacola,
            Florida.
          </p>
          <a
            href="https://www.evergreencottagespensacola.com"
            className="inline-block border border-white/40 rounded-full px-6 py-3"
          >
            Visit Evergreen Cottages ↗
          </a>
        </div>
        <div className="self-center">
          <p className="text-coral-500 uppercase text-xs tracking-widest mb-5">
            Already staying with us?
          </p>
          <h2 className="font-serif text-4xl mb-5">Your stay, all together.</h2>
          <p className="text-sand-500 leading-relaxed mb-8">
            Sign in to review shared payment records, talk with management, and
            keep track of maintenance requests.
          </p>
          <a
            href={portalUrl}
            className="inline-block bg-ocean-700 text-white rounded-full px-7 py-4"
          >
            Guest & resident login ↗
          </a>
        </div>
      </section>
    </PrecisionLayout>
  );
}
export async function getServerSideProps() {
  try {
    return {
      props: { listings: JSON.parse(JSON.stringify(await rentalCatalog())) },
    };
  } catch (e) {
    console.error("Rental catalog unavailable");
    return { props: { listings: [] } };
  }
}
