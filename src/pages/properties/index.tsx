import { useState, useMemo, useCallback } from "react";
import Layout from "../../components/Layout";
import PropertyCard from "../../components/PropertyCard";
import { getProperties, getRecentBookingCounts } from "../../lib/db";
import { Property } from "../../types";
import { useFavorites } from "../../lib/localStorage";

type Props = { properties: Property[]; popularIds: number[] };

const MAX_COMPARE = 3;

const PRICE_RANGES = [
  { key: "any", label: "Any Price", min: 0, max: Infinity },
  { key: "under75", label: "Under $75", min: 0, max: 75 },
  { key: "75-100", label: "$75 – $100", min: 75, max: 100 },
  { key: "100+", label: "$100+", min: 100, max: Infinity },
];

const Properties = ({ properties, popularIds }: Props) => {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("name");
  const [priceRange, setPriceRange] = useState("any");
  const [search, setSearch] = useState("");
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const toggleCompare = useCallback((id: number) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < MAX_COMPARE ? [...prev, id] : prev
    );
  }, []);

  const compareProperties = useMemo(
    () => properties.filter((p) => compareIds.includes(p.id)),
    [properties, compareIds]
  );

  const filtered = useMemo(() => {
    let result = [...properties];

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.address || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    }

    if (filter === "pets") result = result.filter((p) => p.pets_allowed);
    if (filter === "4+") result = result.filter((p) => (p.person_capacity || 2) >= 4);
    if (filter === "bedroom") result = result.filter((p) => (p.bedrooms_number || 0) >= 1);

    const range = PRICE_RANGES.find((r) => r.key === priceRange);
    if (range && range.key !== "any") {
      result = result.filter((p) => {
        const price = p.base_price || 0;
        return price >= range.min && price < range.max;
      });
    }

    if (sort === "price-low") result = [...result].sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
    if (sort === "price-high") result = [...result].sort((a, b) => (b.base_price || 0) - (a.base_price || 0));
    if (sort === "guests") result = [...result].sort((a, b) => (b.person_capacity || 0) - (a.person_capacity || 0));
    if (sort === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [properties, filter, sort, priceRange, search]);

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
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-3 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, description, or address..."
              className="w-full pl-10 pr-4 py-2 border border-sand-200 rounded-xl text-sm bg-sand-50 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all"
              aria-label="Search properties"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sand-400 hover:text-sand-600"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

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
            <div className="flex gap-2">
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="border border-sand-300 rounded-lg px-3 py-1.5 text-sm text-sand-600 bg-white"
                aria-label="Price range"
              >
                {PRICE_RANGES.map((r) => (
                  <option key={r.key} value={r.key}>{r.label}</option>
                ))}
              </select>
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
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sand-400 text-lg font-serif">No properties match your filters.</p>
            <button onClick={() => { setFilter("all"); setPriceRange("any"); setSearch(""); }} className="text-coral-500 font-medium mt-3 hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 stagger">
            {filtered.map((property, i) => (
              <PropertyCard
                key={property.id}
                property={property}
                priority={i < 6}
                comparing={compareIds.includes(property.id)}
                onToggleCompare={toggleCompare}
                isFavorite={isFavorite(property.id)}
                onToggleFavorite={toggleFavorite}
                recentBookings={popularIds.includes(property.id) ? 1 : 0}
              />
            ))}
          </div>
        )}
      </div>
      {/* Compare sticky bar */}
      {compareIds.length >= 2 && (
        <div className="fixed bottom-0 left-0 right-0 bg-ocean-500 text-white px-5 py-3 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.15)]">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-sm font-medium">{compareIds.length} properties selected</span>
            <div className="flex gap-3">
              <button
                onClick={() => setCompareIds([])}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setShowCompare(true)}
                className="bg-white text-ocean-500 px-5 py-2 rounded-full text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Compare
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare modal */}
      {showCompare && compareProperties.length >= 2 && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="compare-title" onClick={() => setShowCompare(false)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 id="compare-title" className="text-xl font-serif text-ocean-500">Compare Properties</h2>
              <button onClick={() => setShowCompare(false)} className="text-sand-400 hover:text-sand-600 text-2xl" aria-label="Close comparison">&times;</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sand-200">
                    <th className="text-left py-3 pr-4 text-sand-400 font-medium w-32">Feature</th>
                    {compareProperties.map((p) => (
                      <th key={p.id} className="text-left py-3 px-3 font-semibold text-ocean-500 min-w-[160px]">{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {[
                    { label: "Price/night", render: (p: Property) => `$${p.base_price || 65}` },
                    { label: "Cleaning fee", render: (p: Property) => `$${p.cleaning_fee || 65}` },
                    { label: "Guests", render: (p: Property) => `${p.person_capacity || 2}` },
                    { label: "Bedrooms", render: (p: Property) => `${p.bedrooms_number || 0}` },
                    { label: "Bathrooms", render: (p: Property) => `${p.bathrooms_number || 1}` },
                    { label: "Pets", render: (p: Property) => p.pets_allowed ? "Yes ($50 fee)" : "No" },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="py-3 pr-4 text-sand-400 font-medium">{row.label}</td>
                      {compareProperties.map((p) => (
                        <td key={p.id} className="py-3 px-3 text-sand-700">{row.render(p)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Properties;

export const getServerSideProps = async () => {
  const [properties, bookingCounts] = await Promise.all([
    getProperties("Pensacola"),
    getRecentBookingCounts(),
  ]);
  // Only expose which properties are popular (>= 2 bookings), not raw counts
  const popularIds = Object.entries(bookingCounts)
    .filter(([, count]) => count >= 2)
    .map(([id]) => Number(id));
  return {
    props: {
      properties: JSON.parse(JSON.stringify(properties)),
      popularIds,
    },
  };
};
