import { useState } from "react";
import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import PrecisionLayout, {
  precisionBase,
} from "../../../components/PrecisionLayout";
import { rentalListing, RentalListing } from "../../../lib/rental-catalog";
export default function Home({ listing: l }: { listing: RentalListing }) {
  const [error, setError] = useState(""),
    [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch("/api/rental-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, property_id: l.property_id }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Unable to submit");
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to submit");
    } finally {
      setBusy(false);
    }
  }
  return (
    <PrecisionLayout title={l.title} description={l.description.slice(0, 160)}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-36 pb-24">
        <Link
          href={precisionBase + "/properties"}
          className="text-sm text-sand-500"
        >
          ← All homes
        </Link>
        <p className="text-coral-500 uppercase text-xs tracking-widest mt-8 mb-4">
          {[l.city, l.state].filter(Boolean).join(", ")}
        </p>
        <h1 className="font-serif text-5xl mb-8">{l.title}</h1>
        {l.image_url && (
          <img
            src={l.image_url}
            alt={l.title}
            className="w-full max-h-[560px] object-cover rounded-2xl mb-12"
          />
        )}
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="flex gap-3 mb-8 flex-wrap">
              {l.rental_terms.map((t) => (
                <span
                  key={t}
                  className="bg-white border rounded-full px-4 py-2 text-sm"
                >
                  {t} term
                </span>
              ))}
            </div>
            <h2 className="font-serif text-3xl mb-5">Make yourself at home.</h2>
            <p className="text-sand-500 whitespace-pre-wrap leading-relaxed">
              {l.description || "Contact our team for details about this home."}
            </p>
            <dl className="grid grid-cols-3 border-y border-sand-200 py-6 mt-10 gap-4">
              {l.bedrooms_number !== null && (
                <div>
                  <dt className="text-sm text-sand-500">Bedrooms</dt>
                  <dd className="font-serif text-2xl">{l.bedrooms_number}</dd>
                </div>
              )}
              {l.bathrooms_number !== null && (
                <div>
                  <dt className="text-sm text-sand-500">Bathrooms</dt>
                  <dd className="font-serif text-2xl">{l.bathrooms_number}</dd>
                </div>
              )}
              {l.person_capacity !== null && (
                <div>
                  <dt className="text-sm text-sand-500">Guests</dt>
                  <dd className="font-serif text-2xl">{l.person_capacity}</dd>
                </div>
              )}
            </dl>
          </div>
          <aside className="border rounded-2xl p-7 bg-white self-start">
            <h2 className="font-serif text-3xl mb-4">Picture yourself here.</h2>
            {l.nightly_cents && (
              <p className="mb-2">
                ${(l.nightly_cents / 100).toLocaleString()} / night
              </p>
            )}
            {l.monthly_cents && (
              <p className="mb-2">
                ${(l.monthly_cents / 100).toLocaleString()} / month
              </p>
            )}
            <p className="text-xs text-sand-500 mb-6">
              Ask us about availability, total pricing and rental terms. An
              inquiry does not reserve this home.
            </p>
            {sent ? (
              <p role="status" className="text-evergreen-600">
                Thank you. Your inquiry has reached our team. We'll reply using
                the email you provided.
              </p>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <label className="block text-sm">
                  Your name
                  <input
                    required
                    name="name"
                    maxLength={160}
                    autoComplete="name"
                    className="block w-full border rounded-lg p-3 mt-2"
                  />
                </label>
                <label className="block text-sm">
                  Email
                  <input
                    required
                    name="email"
                    type="email"
                    maxLength={254}
                    autoComplete="email"
                    className="block w-full border rounded-lg p-3 mt-2"
                  />
                </label>
                <label className="block text-sm">
                  Rental term
                  <select
                    name="rental_term"
                    className="block w-full border rounded-lg p-3 mt-2"
                  >
                    {l.rental_terms.map((t) => (
                      <option key={t} value={t}>
                        {t} term
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  Tell us about your stay
                  <textarea
                    required
                    name="message"
                    maxLength={4000}
                    rows={4}
                    placeholder="Move-in date, length of stay, and questions"
                    className="block w-full border rounded-lg p-3 mt-2"
                  />
                </label>
                <div aria-hidden="true" className="hidden">
                  <label>
                    Company
                    <input name="company" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
                {error && (
                  <p role="alert" className="text-red-600 text-sm">
                    {error}
                  </p>
                )}
                <button
                  disabled={busy}
                  className="w-full bg-ocean-700 text-white rounded-full p-4 disabled:opacity-50"
                >
                  {busy ? "Sending…" : "Ask about this home ↗"}
                </button>
                <p className="text-xs text-sand-500">
                  Your details are shared with Precision Management to respond
                  to this inquiry.
                </p>
              </form>
            )}
          </aside>
        </div>
      </div>
    </PrecisionLayout>
  );
}
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const value = String(ctx.params?.id || "");
  if (!/^[1-9]\d*$/.test(value)) return { notFound: true };
  try {
    const listing = await rentalListing(Number(value));
    if (!listing) return { notFound: true };
    return { props: { listing: JSON.parse(JSON.stringify(listing)) } };
  } catch {
    throw new Error("Rental listing temporarily unavailable");
  }
}
