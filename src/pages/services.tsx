import Layout from "../components/Layout";

const services = [
  {
    title: "Airport Shuttle",
    price: "$25 each way",
    desc: "Pickup from or drop-off to Pensacola International Airport. Availability based on timing.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
  },
  {
    title: "Early Check-in",
    price: "From $25",
    desc: "Standard early check-in (1 PM) is $25. Super early (7 AM) is $40. Subject to availability.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  {
    title: "Late Check-out",
    price: "Ask us",
    desc: "Need extra hours? We'll do our best to accommodate a late checkout.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />,
  },
  {
    title: "Extend Your Stay",
    price: "Pay direct & save",
    desc: "Extend your stay and pay directly — no platform fees. We'll check availability.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  },
  {
    title: "Pet Friendly",
    price: "$50 per pet",
    desc: "Furry friends welcome. Small dog park on site. $50 per pet per stay.",
    icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></>,
  },
  {
    title: "Pack-N-Play",
    price: "Free",
    desc: "Traveling with a baby? We provide a crib at no extra charge.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  },
];

export default function Services() {
  return (
    <Layout title="Services" description="Airport shuttle, early check-in, pet accommodations, and more.">
      <div className="bg-ocean-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 text-center">
          <p className="text-coral-400 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Extras</p>
          <h1 className="text-4xl md:text-5xl font-serif mb-3">Services & Add-ons</h1>
          <p className="text-white/60 max-w-lg mx-auto">Make your stay even better.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
          {services.map((s) => (
            <div key={s.title} className="bg-white border border-sand-100 rounded-2xl p-7 card-lift fade-in-up">
              <div className="w-12 h-12 bg-ocean-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-ocean-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {s.icon}
                </svg>
              </div>
              <h3 className="text-lg font-serif text-ocean-500 mb-1">{s.title}</h3>
              <p className="text-coral-500 font-semibold text-sm mb-3">{s.price}</p>
              <p className="text-sand-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-16 bg-white rounded-2xl p-12 border border-sand-100">
          <h2 className="text-2xl font-serif text-ocean-500 mb-3">Interested?</h2>
          <p className="text-sand-500 mb-8">Call or text us and we&apos;ll handle everything.</p>
          <a href="tel:+15108227060" className="bg-ocean-500 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-ocean-600 transition-all inline-block">
            (510) 822-7060
          </a>
        </div>
      </div>
    </Layout>
  );
}
