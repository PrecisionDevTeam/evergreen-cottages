import { useState } from "react";
import Link from "next/link";
import { GetStaticProps } from "next";
import Layout from "../components/Layout";
import Breadcrumbs from "../components/Breadcrumbs";
import { getWebsiteContent } from "../lib/db";

type DbService = {
  name: string;
  price: number;
  desc: string;
  enabled: boolean;
};

type Service = {
  title: string;
  price: string;
  desc: string;
  icon: JSX.Element;
  serviceId?: string;
};

const services: Service[] = [
  {
    title: "Airport Pickup",
    price: "$25",
    desc: "One-way pickup from Pensacola International Airport. Availability based on timing.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
    serviceId: "airport-pickup",
  },
  {
    title: "Airport Drop-off",
    price: "$25",
    desc: "One-way drop-off to Pensacola International Airport.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
    serviceId: "airport-dropoff",
  },
  {
    title: "Early Check-in (1 PM)",
    price: "$25",
    desc: "Standard early check-in at 1:00 PM. Subject to availability.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    serviceId: "early-checkin-standard",
  },
  {
    title: "Super Early Check-in (7 AM)",
    price: "$40",
    desc: "Super early check-in at 7:00 AM. Subject to availability.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    serviceId: "early-checkin-super",
  },
  {
    title: "Late Check-out",
    price: "Ask us",
    desc: "Need extra hours? Call or text to check availability.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />,
  },
  {
    title: "Pet Fee",
    price: "$50 per pet",
    desc: "Furry friends welcome. Small dog park on site. $50 per pet per stay.",
    icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></>,
    serviceId: "pet-fee",
  },
  {
    title: "Extend Your Stay",
    price: "Pay direct & save",
    desc: "Extend your stay and pay directly — no platform fees. We'll check availability.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  },
  {
    title: "Pack-N-Play",
    price: "Free",
    desc: "Traveling with a baby? We provide a crib at no extra charge. Just let us know.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  },
];

type ServicesPageProps = {
  dbServices: { name: string; price: number; desc: string; enabled: boolean }[] | null;
};

export const getStaticProps: GetStaticProps<ServicesPageProps> = async () => {
  try {
    const raw = await getWebsiteContent("services");
    const dbServices = Array.isArray(raw)
      ? (raw as DbService[])
          .filter((s) => s.enabled && typeof s.name === "string" && typeof s.price === "number")
          .map((s) => ({ name: s.name, price: s.price, desc: s.desc || "", enabled: true }))
      : null;
    return { props: { dbServices }, revalidate: 60 };
  } catch {
    return { props: { dbServices: null }, revalidate: 60 };
  }
};

export default function Services({ dbServices }: ServicesPageProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [unitLabel, setUnitLabel] = useState("");
  const [flightInfo, setFlightInfo] = useState("");

  const getPropertyName = () => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("property") || "";
  };

  const isAirportService = (id: string) => id.startsWith("airport-");

  const handleBuyClick = (serviceId: string) => {
    setShowForm(serviceId);
    setGuestName("");
    setUnitLabel("");
    setFlightInfo("");
  };

  const handlePay = async (serviceId: string) => {
    if (!guestName.trim()) {
      alert("Please enter your name.");
      return;
    }
    setLoading(serviceId);
    try {
      const res = await fetch("/api/service-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          guestName: guestName.trim(),
          propertyName: getPropertyName(),
          unitLabel: unitLabel.trim() || undefined,
          flightInfo: flightInfo.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Checkout failed");
      }
    } catch (err) {
      setLoading(null);
      const message = err instanceof Error ? err.message : "Something went wrong";
      alert(`Payment error: ${message}. Please call (510) 822-7060.`);
    }
  };

  return (
    <Layout title="Services & Add-ons" description="Airport shuttle, early check-in, pet fee, and more for your Pensacola vacation rental stay at Evergreen Cottages.">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-20">
        <Breadcrumbs items={[{ label: "Services" }]} />
        <p className="text-coral-500 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Extras</p>
        <h1 className="text-4xl md:text-5xl font-serif text-ocean-500 mb-3">Services & Add-ons</h1>
        <p className="text-sand-500 mb-12">Make your stay even better. Pay online or call to arrange.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
          {(dbServices
            ? dbServices.map((ds) => {
                // Match DB service to hardcoded one for icon + serviceId
                const match = services.find((s) => s.title.toLowerCase() === ds.name.toLowerCase());
                return {
                  title: ds.name,
                  price: ds.price === 0 ? "Free" : `$${ds.price}`,
                  desc: ds.desc,
                  icon: match?.icon || <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />,
                  serviceId: match?.serviceId,
                } as Service;
              })
            : services
          ).map((s) => (
            <div key={s.title} className="bg-white border border-sand-100 rounded-2xl p-7 card-lift fade-in-up flex flex-col">
              <div className="w-12 h-12 bg-ocean-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-ocean-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {s.icon}
                </svg>
              </div>
              <h3 className="text-lg font-serif text-ocean-500 mb-1">{s.title}</h3>
              <p className="text-coral-500 font-semibold text-sm mb-3">{s.price}</p>
              <p className="text-sand-500 text-sm leading-relaxed mb-4 flex-1">{s.desc}</p>
              {s.serviceId && showForm === s.serviceId ? (
                <div className="space-y-2 mt-2">
                  <input
                    type="text"
                    placeholder="Your name *"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full border border-sand-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ocean-400"
                  />
                  <input
                    type="text"
                    placeholder="Unit number (e.g. 5)"
                    value={unitLabel}
                    onChange={(e) => setUnitLabel(e.target.value)}
                    className="w-full border border-sand-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ocean-400"
                  />
                  {isAirportService(s.serviceId) && (
                    <input
                      type="text"
                      placeholder="Flight info (airline, time)"
                      value={flightInfo}
                      onChange={(e) => setFlightInfo(e.target.value)}
                      className="w-full border border-sand-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ocean-400"
                    />
                  )}
                  <button
                    onClick={() => handlePay(s.serviceId!)}
                    disabled={loading === s.serviceId}
                    className="w-full bg-ocean-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-ocean-600 transition-colors disabled:opacity-50"
                  >
                    {loading === s.serviceId ? "Processing..." : `Pay ${s.price}`}
                  </button>
                </div>
              ) : s.serviceId ? (
                <button
                  onClick={() => handleBuyClick(s.serviceId!)}
                  className="w-full bg-ocean-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-ocean-600 transition-colors"
                >
                  {`Pay ${s.price}`}
                </button>
              ) : (
                <a
                  href="sms:+15108227060"
                  className="w-full text-center border border-ocean-500 text-ocean-500 py-2.5 rounded-xl font-semibold text-sm hover:bg-ocean-50 transition-colors block"
                >
                  Text to Arrange
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-16 bg-white rounded-2xl p-12 border border-sand-100">
          <h2 className="text-2xl font-serif text-ocean-500 mb-3">Questions?</h2>
          <p className="text-sand-500 mb-8">Call or text us and we&apos;ll handle everything.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+15108227060" className="bg-ocean-500 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-ocean-600 transition-all inline-block">
              (510) 822-7060
            </a>
            <Link href="/properties" className="border-2 border-ocean-500 text-ocean-500 px-8 py-3.5 rounded-full font-semibold hover:bg-ocean-50 transition-all inline-block">
              Browse Properties
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
