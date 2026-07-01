import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import PropertyCard from "../../components/PropertyCard";
import { getPropertiesWithOverrides, getRecentBookingCounts } from "../../lib/db";
import { Property } from "../../types";
import { useFavorites } from "../../lib/localStorage";

type Props = { properties: Property[]; popularIds: number[] };

type AvailabilityInfo = { id: number; nights: number; nightly: number; total: number };

const MAX_COMPARE = 3;

const todayKey = () => new Date().toISOString().split("T")[0];

const fmtRange = (ci: string, co: string) => {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const a = new Date(ci + "T12:00:00").toLocaleDateString("en-US", opts);
  const b = new Date(co + "T12:00:00").toLocaleDateString("en-US", opts);
  return `${a} – ${b}`;
};

const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const PRICE_RANGES = [
  { key: "any", label: "Any Price", min: 0, max: Infinity },
  { key: "under75", label: "Under $75", min: 0, max: 75 },
  { key: "75-100", label: "$75 – $100", min: 75, max: 100 },
  { key: "100+", label: "$100+", min: 100, max: Infinity },
];

const Properties = ({ properties, popularIds }: Props) => {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("name");
  const [priceRange, setPriceRange] = useState("any");
  const [search, setSearch] = useState("");
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Availability search
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [searchGuests, setSearchGuests] = useState(1);
  const [availLoading, setAvailLoading] = useState(false);
  const [availError, setAvailError] = useState("");
  // Active search results: map of property id → pricing, plus the searched context.
  const [availResult, setAvailResult] = useState<{
    checkIn: string;
    checkOut: string;
    nights: number;
    guests: number;
    map: Record<number, AvailabilityInfo>;
  } | null>(null);

  const runSearch = useCallback(async (ci: string, co: string, g: number) => {
    if (!ci || !co) return;
    if (co <= ci) {
      setAvailError("Check-out must be after check-in.");
      return;
    }
    setAvailLoading(true);
    setAvailError("");
    try {
      const res = await fetch("/api/search-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkIn: ci, checkOut: co, guests: g }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      const map: Record<number, AvailabilityInfo> = {};
      for (const r of data.results as AvailabilityInfo[]) map[r.id] = r;
      setAvailResult({ checkIn: ci, checkOut: co, nights: data.nights, guests: data.guests, map });
      setSort("price-low");
    } catch (err) {
      setAvailError(err instanceof Error ? err.message : "Could not check availability");
      setAvailResult(null);
    } finally {
      setAvailLoading(false);
    }
  }, []);

  // Auto-run search from query params (e.g. arriving from the home hero).
  useEffect(() => {
    if (!router.isReady) return;
    const qCheckIn = typeof router.query.checkIn === "string" ? router.query.checkIn : "";
    const qCheckOut = typeof router.query.checkOut === "string" ? router.query.checkOut : "";
    const qGuests = typeof router.query.guests === "string" ? parseInt(router.query.guests, 10) : 1;
    if (qCheckIn && qCheckOut) {
      setCheckIn(qCheckIn);
      setCheckOut(qCheckOut);
      setSearchGuests(qGuests || 1);
      runSearch(qCheckIn, qCheckOut, qGuests || 1);
    }
    // Only on first ready — subsequent searches are user-driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const clearSearch = () => {
    setCheckIn("");
    setCheckOut("");
    setSearchGuests(1);
    setAvailResult(null);
    setAvailError("");
  };

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

    // Availability search — restrict to units open for the selected dates
    if (availResult) {
      result = result.filter((p) => availResult.map[p.id]);
    }

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

    const priceOf = (p: Property) =>
      availResult ? availResult.map[p.id]?.total ?? p.base_price ?? 0 : p.base_price || 0;
    if (sort === "price-low") result = [...result].sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "price-high") result = [...result].sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === "guests") result = [...result].sort((a, b) => (b.person_capacity || 0) - (a.person_capacity || 0));
    if (sort === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [properties, filter, sort, priceRange, search, availResult]);

  const filters = [
    { key: "all", label: "All" },
    { key: "pets", label: "Pets OK" },
    { key: "4+", label: "4+ Guests" },
    { key: "bedroom", label: "1+ Bedroom" },
  ];

  return (
    <Layout title="Pensacola Vacation Rentals" description="Browse 17 pet-friendly vacation rentals near Pensacola Beach, FL. Book direct and save 10-15% vs Airbnb. From $60/night.">
      <div className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10">
          <p className="text-coral-500 text-xs uppercase tracking-[0.2em] font-semibold mb-2">Browse</p>
          <h1 className="text-4xl font-serif text-ocean-500">Pensacola Vacation Rentals</h1>
          <p className="text-sand-500 mt-1">
            {availResult
              ? `${filtered.length} of ${properties.length} units available ${fmtRange(availResult.checkIn, availResult.checkOut)} for ${availResult.guests} guest${availResult.guests > 1 ? "s" : ""}`
              : `${filtered.length} vacation rentals in Pensacola, FL`}
          </p>

          {/* Availability search — check all units at once */}
          <div className="mt-6 bg-sand-50 border border-sand-200 rounded-2xl p-4 sm:p-5">
            <p className="text-sm font-semibold text-ocean-600 mb-3">
              Check every unit at once — pick your dates and party size
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <label htmlFor="ci" className="block text-xs text-sand-500 mb-1">Check-in</label>
                <input
                  id="ci"
                  type="date"
                  value={checkIn}
                  min={todayKey()}
                  onChange={(e) => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut(""); }}
                  className="w-full border border-sand-300 rounded-lg px-3 py-2 text-sm text-sand-700 bg-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="co" className="block text-xs text-sand-500 mb-1">Check-out</label>
                <input
                  id="co"
                  type="date"
                  value={checkOut}
                  min={checkIn || todayKey()}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full border border-sand-300 rounded-lg px-3 py-2 text-sm text-sand-700 bg-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                />
              </div>
              <div className="sm:w-32">
                <label htmlFor="sg" className="block text-xs text-sand-500 mb-1">Guests</label>
                <select
                  id="sg"
                  value={searchGuests}
                  onChange={(e) => setSearchGuests(parseInt(e.target.value, 10))}
                  className="w-full border border-sand-300 rounded-lg px-3 py-2 text-sm text-sand-700 bg-white focus:ring-2 focus:ring-ocean-500 outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} guest{i > 0 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => runSearch(checkIn, checkOut, searchGuests)}
                disabled={!checkIn || !checkOut || availLoading}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                  checkIn && checkOut && !availLoading
                    ? "bg-ocean-500 text-white hover:bg-ocean-600"
                    : "bg-sand-200 text-sand-400 cursor-not-allowed"
                }`}
              >
                {availLoading && <Spinner />}
                {availLoading ? "Checking…" : "Check availability"}
              </button>
              {availResult && (
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 rounded-lg text-sm text-sand-500 hover:text-ocean-500 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            {availError && <p className="text-xs text-coral-500 mt-2">{availError}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-sand-100 sticky top-20 z-40">
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
        {availLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-ocean-500">
            <Spinner className="w-8 h-8" />
            <p className="text-sand-500 mt-4 text-sm">Checking availability across all units…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sand-400 text-lg font-serif">
              {availResult
                ? `No units are available ${fmtRange(availResult.checkIn, availResult.checkOut)} for ${availResult.guests} guest${availResult.guests > 1 ? "s" : ""}.`
                : "No properties match your filters."}
            </p>
            {availResult ? (
              <div className="mt-3 flex flex-col items-center gap-2">
                <button onClick={clearSearch} className="text-coral-500 font-medium hover:underline">
                  Clear dates &amp; view all units
                </button>
                <a href="tel:+15108227060" className="text-sm text-ocean-500 hover:text-coral-500">
                  Or call (510) 822-7060 — we may have options
                </a>
              </div>
            ) : (
              <button onClick={() => { setFilter("all"); setPriceRange("any"); setSearch(""); }} className="text-coral-500 font-medium mt-3 hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 stagger">
            {filtered.map((property, i) => {
              const info = availResult?.map[property.id];
              return (
                <PropertyCard
                  key={property.id}
                  property={property}
                  priority={i < 6}
                  comparing={compareIds.includes(property.id)}
                  onToggleCompare={toggleCompare}
                  isFavorite={isFavorite(property.id)}
                  onToggleFavorite={toggleFavorite}
                  recentBookings={popularIds.includes(property.id) ? 1 : 0}
                  availability={
                    info && availResult
                      ? { nights: info.nights, nightly: info.nightly, total: info.total, checkIn: availResult.checkIn, checkOut: availResult.checkOut, guests: availResult.guests }
                      : null
                  }
                />
              );
            })}
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
                    { label: "Cleaning fee", render: () => "$65" },
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
    getPropertiesWithOverrides("Pensacola"),
    getRecentBookingCounts(),
  ]);
  // Only badge the top 3 most-booked units
  const popularIds = Object.entries(bookingCounts)
    .filter(([, count]) => count >= 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id]) => Number(id));
  // Trim heavy fields — listing page only needs card data, not full descriptions/images
  const trimmed = properties.map((p: any) => ({
    ...p,
    images: p.images.slice(0, 8),
    description: p.description ? p.description.slice(0, 200) : null,
    listing_images: undefined,
    amenities: undefined,
  }));
  return {
    props: {
      properties: JSON.parse(JSON.stringify(trimmed)),
      popularIds,
    },
  };
};
