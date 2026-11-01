import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import PrecisionLayout from "../../../components/PrecisionLayout";
import RentalCard from "../../../components/RentalCard";
import { rentalCatalog, RentalListing } from "../../../lib/rental-catalog";
export default function Homes({
  listings,
  unavailable,
}: {
  listings: RentalListing[];
  unavailable: boolean;
}) {
  const router = useRouter(),
    [term, setTerm] = useState("all"),
    [city, setCity] = useState("all"),
    [search, setSearch] = useState("");
  useEffect(() => {
    if (["short", "mid", "long"].includes(String(router.query.term)))
      setTerm(String(router.query.term));
  }, [router.query.term]);
  const cities = Array.from(
    new Set(listings.map((l) => l.city).filter((c): c is string => !!c)),
  ).sort();
  const filtered = useMemo(
    () =>
      listings.filter(
        (l) =>
          (term === "all" || l.rental_terms.includes(term)) &&
          (city === "all" || l.city === city) &&
          (l.title + " " + l.city + " " + l.state)
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [listings, term, city, search],
  );
  return (
    <PrecisionLayout title="Find a home">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-44 pb-24">
        <p className="text-coral-500 uppercase text-xs tracking-widest mb-5">
          The Precision collection
        </p>
        <h1 className="font-serif text-5xl md:text-6xl mb-6">
          Somewhere that feels like you.
        </h1>
        <p className="text-sand-500 max-w-xl mb-10">
          Explore homes for a few nights, an extended stay, or your next
          chapter. Contact us to confirm availability and terms.
        </p>
        <div className="border-y border-sand-200 py-6 mb-10 flex flex-wrap gap-4">
          <label className="text-xs flex-1 min-w-44">
            Search
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Home or destination"
              className="block w-full bg-white border rounded-lg p-3 mt-2 text-sm"
            />
          </label>
          <label className="text-xs flex-1 min-w-44">
            Destination
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="block w-full bg-white border rounded-lg p-3 mt-2 text-sm"
            >
              <option value="all">All destinations</option>
              {cities.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-xs flex-1 min-w-44">
            Ways to stay
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="block w-full bg-white border rounded-lg p-3 mt-2 text-sm"
            >
              <option value="all">All rental terms</option>
              <option value="short">Short term</option>
              <option value="mid">Mid term</option>
              <option value="long">Long term</option>
            </select>
          </label>
        </div>
        <p className="text-xs uppercase text-sand-500 tracking-widest mb-8">
          {filtered.length} homes
        </p>
        {filtered.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {filtered.map((l) => (
              <RentalCard key={l.property_id} listing={l} />
            ))}
          </div>
        ) : (
          <div className="border rounded-2xl p-10 bg-white">
            <h2 className="font-serif text-3xl mb-4">
              {unavailable
                ? "Our collection is temporarily unavailable."
                : "Let's find your place."}
            </h2>
            <p className="text-sand-500 mb-5">
              {unavailable
                ? "Please contact us for current homes and availability."
                : "Try another destination or rental term, or ask our team about current homes."}
            </p>
            <a href="mailto:hello@staywithprecision.com" className="underline">
              Contact Precision ↗
            </a>
          </div>
        )}
      </div>
    </PrecisionLayout>
  );
}
export async function getServerSideProps() {
  try {
    return {
      props: {
        listings: JSON.parse(JSON.stringify(await rentalCatalog())),
        unavailable: false,
      },
    };
  } catch {
    return { props: { listings: [], unavailable: true } };
  }
}
