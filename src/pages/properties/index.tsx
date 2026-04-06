import { useState, useMemo } from "react";
import Layout from "../../components/Layout";
import PropertyCard from "../../components/PropertyCard";
import { getProperties } from "../../lib/db";
import { Property } from "../../types";

type Props = { properties: Property[] };

const Properties = ({ properties }: Props) => {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("name");

  const filtered = useMemo(() => {
    let result = [...properties];
    if (filter === "pets") result = result.filter((p) => p.pets_allowed);
    if (filter === "4+") result = result.filter((p) => (p.person_capacity || 2) >= 4);
    if (filter === "bedroom") result = result.filter((p) => (p.bedrooms_number || 0) >= 1);
    if (sort === "price-low") result.sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
    if (sort === "price-high") result.sort((a, b) => (b.base_price || 0) - (a.base_price || 0));
    if (sort === "guests") result.sort((a, b) => (b.person_capacity || 0) - (a.person_capacity || 0));
    if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [properties, filter, sort]);

  const filters = [
    { key: "all", label: "All" },
    { key: "pets", label: "Pets OK" },
    { key: "4+", label: "4+ Guests" },
    { key: "bedroom", label: "1+ Bedroom" },
  ];

  return (
    <Layout title="Properties" description="Browse 17 vacation rentals in Pensacola, FL.">
      <div className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10">
          <p className="text-coral-500 text-xs uppercase tracking-[0.2em] font-semibold mb-2">Browse</p>
          <h1 className="text-4xl font-serif text-ocean-500">All Properties</h1>
          <p className="text-sand-500 mt-1">{filtered.length} vacation rentals in Pensacola, FL</p>
        </div>
      </div>

      <div className="bg-white border-b border-sand-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    filter === f.key
                      ? "bg-ocean-500 text-white"
                      : "bg-sand-100 text-sand-600 hover:bg-sand-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-sand-300 rounded-lg px-3 py-1.5 text-sm text-sand-600 bg-white"
              aria-label="Sort"
            >
              <option value="name">Sort: Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="guests">Most Guests</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sand-400 text-lg font-serif">No properties match your filters.</p>
            <button onClick={() => setFilter("all")} className="text-coral-500 font-medium mt-3 hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 stagger">
            {filtered.map((property, i) => (
              <PropertyCard key={property.id} property={property} priority={i < 6} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Properties;

export const getStaticProps = async () => {
  const properties = await getProperties("Pensacola");
  return { props: { properties: JSON.parse(JSON.stringify(properties)) }, revalidate: 3600 };
};
