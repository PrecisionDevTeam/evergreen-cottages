import { useState, useMemo } from "react";
import Layout from "../../components/Layout";
import PropertyCard from "../../components/PropertyCard";
import { getProperties } from "../../lib/db";
import { Property } from "../../types";

type Props = {
  properties: Property[];
};

const Properties = ({ properties }: Props) => {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("name");

  const filtered = useMemo(() => {
    let result = [...properties];

    // Filter
    if (filter === "pets") result = result.filter((p) => p.pets_allowed);
    if (filter === "4+") result = result.filter((p) => (p.person_capacity || 2) >= 4);
    if (filter === "bedroom") result = result.filter((p) => (p.bedrooms_number || 0) >= 1);

    // Sort
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
    <Layout title="Properties" description="Browse 17 vacation rentals in Pensacola, FL. Studios, 1-bedrooms, pet-friendly options.">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">All Properties</h1>
          <p className="text-gray-500 mt-1">{filtered.length} vacation rentals in Pensacola, FL</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === f.key
                      ? "bg-evergreen-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-600"
              aria-label="Sort properties"
            >
              <option value="name">Sort: Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="guests">Most Guests</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No properties match your filters.</p>
            <button
              onClick={() => setFilter("all")}
              className="text-evergreen-600 font-medium mt-2 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
  return {
    props: {
      properties: JSON.parse(JSON.stringify(properties)),
    },
    revalidate: 3600,
  };
};
