import { useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import Breadcrumbs from "../components/Breadcrumbs";

type FAQItem = { q: string; a: string };

const FAQ_SECTIONS: { title: string; items: FAQItem[] }[] = [
  {
    title: "Booking & Cancellation",
    items: [
      {
        q: "How do I book a property?",
        a: "Select your dates on any property page and click 'Book Now'. You can also call or text us at (510) 822-7060 to book directly.",
      },
      {
        q: "What is the cancellation policy?",
        a: "Free cancellation up to 48 hours before check-in. After that, the first night is non-refundable. Contact us for special circumstances.",
      },
      {
        q: "Why should I book direct instead of Airbnb or VRBO?",
        a: "You save 10-15% by avoiding platform fees. You also get direct contact with our team, faster responses, and flexible date changes.",
      },
      {
        q: "Do you require a deposit?",
        a: "Yes, a security deposit may be required depending on the property. It is fully refundable if the unit is left in good condition.",
      },
    ],
  },
  {
    title: "Check-in & Access",
    items: [
      {
        q: "What time is check-in and check-out?",
        a: "Check-in is at 4:00 PM and check-out is at 11:00 AM. Early check-in and late check-out are available for an additional fee, subject to availability.",
      },
      {
        q: "How do I access the property?",
        a: "All units use keyless smart locks. Your unique door code is sent via text before your arrival. No physical keys needed.",
      },
      {
        q: "Is there a gate code?",
        a: "Yes, the gate code is needed after 8 PM. It will be included in your check-in instructions.",
      },
    ],
  },
  {
    title: "Pets",
    items: [
      {
        q: "Are pets allowed?",
        a: "Most units are pet-friendly. There is a $50 pet fee per pet per stay. We have a small dog park on-site.",
      },
      {
        q: "Are there breed or size restrictions?",
        a: "We don't have breed restrictions, but please let us know about your pet when booking so we can assign a pet-friendly unit.",
      },
    ],
  },
  {
    title: "Parking & Location",
    items: [
      {
        q: "Is parking available?",
        a: "Yes, each unit comes with one free on-site parking spot. Additional street parking is also available nearby.",
      },
      {
        q: "How far is the beach?",
        a: "Pensacola Beach is about 20-25 minutes by car. Downtown Pensacola is 10-12 minutes away.",
      },
      {
        q: "What is the address?",
        a: "3801 Mobile Highway, Pensacola, FL 32505. We're centrally located near shopping, dining, NAS Pensacola, and the airport.",
      },
    ],
  },
  {
    title: "WiFi & Amenities",
    items: [
      {
        q: "Is WiFi included?",
        a: "Yes, free high-speed WiFi is included in every unit. The network name and password are provided in your check-in details.",
      },
      {
        q: "What amenities are included?",
        a: "Every unit includes a fully equipped kitchen, air conditioning, heating, smart TV, washer/dryer access, fresh linens, and toiletries.",
      },
      {
        q: "Is there a washer and dryer?",
        a: "Coin-operated laundry facilities are available on-site and shared with other guests.",
      },
      {
        q: "Do you provide a crib or Pack-N-Play?",
        a: "Yes, we provide a Pack-N-Play at no extra charge. Just let us know when you book.",
      },
    ],
  },
  {
    title: "During Your Stay",
    items: [
      {
        q: "What if something breaks or stops working?",
        a: "Text or call us at (510) 822-7060 anytime. We also have a troubleshooting portal accessible via QR code in each unit for common issues like WiFi, AC, or lockouts.",
      },
      {
        q: "Can I extend my stay?",
        a: "Yes, contact us and we'll check availability. Extending directly saves you platform fees compared to rebooking on Airbnb.",
      },
      {
        q: "What are quiet hours?",
        a: "Quiet hours are 10 PM to 8 AM. Please be mindful of other guests and neighbors.",
      },
    ],
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-sand-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-ocean-700 group-hover:text-ocean-500 transition-colors pr-4">
          {item.q}
        </span>
        <svg
          className={`w-5 h-5 text-sand-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-4 text-sand-600 text-sm leading-relaxed">
          {item.a}
        </div>
      )}
    </div>
  );
}

// Build FAQPage schema from all sections
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_SECTIONS.flatMap((s) =>
    s.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    }))
  ),
};

export default function FAQ() {
  return (
    <Layout
      title="FAQ"
      description="Frequently asked questions about booking, check-in, pets, parking, WiFi, and more at Evergreen Cottages."
      schema={faqSchema}
    >
      <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 py-20">
        <Breadcrumbs items={[{ label: "FAQ" }]} />
        <p className="text-coral-500 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Help</p>
        <h1 className="text-4xl md:text-5xl font-serif text-ocean-500 mb-4">Frequently Asked Questions</h1>
        <p className="text-sand-500 mb-12">Everything you need to know before booking your stay.</p>

        <div className="space-y-10">
          {FAQ_SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-serif text-ocean-500 mb-4">{section.title}</h2>
              <div className="bg-white rounded-2xl border border-sand-100 px-6">
                {section.items.map((item) => (
                  <FAQAccordion key={item.q} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-white rounded-2xl p-10 border border-sand-100">
          <h2 className="text-xl font-serif text-ocean-500 mb-3">Still have questions?</h2>
          <p className="text-sand-500 mb-6">Our team is available 24/7 by phone or text.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+15108227060" className="bg-ocean-500 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-ocean-600 transition-all">
              Call or Text (510) 822-7060
            </a>
            <Link href="/contact" className="border-2 border-ocean-500 text-ocean-500 px-8 py-3.5 rounded-full font-semibold hover:bg-ocean-50 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
