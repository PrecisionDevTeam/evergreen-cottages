import Link from "next/link";
import Layout from "../components/Layout";

const services = [
  {
    icon: "✈️",
    title: "Airport Pickup & Drop-off",
    price: "$25 each way",
    description: "We'll pick you up from Pensacola International Airport or drop you off. Available depending on timing and availability.",
  },
  {
    icon: "🕐",
    title: "Early Check-in",
    price: "From $25",
    description: "Check in before 4 PM. Standard early check-in (1 PM) is $25. Super early (7 AM) is $40. Subject to availability.",
  },
  {
    icon: "🕑",
    title: "Late Check-out",
    price: "Subject to availability",
    description: "Need a few extra hours? Request a late check-out and we'll do our best to accommodate you.",
  },
  {
    icon: "📅",
    title: "Extend Your Stay",
    price: "Pay direct & save",
    description: "Love it here? Extend your stay and pay directly — no platform fees. We'll check availability and get you a rate.",
  },
  {
    icon: "🐾",
    title: "Pet Fee",
    price: "$50 per pet",
    description: "We welcome your furry friends! We have a small dog park on site. $50 pet fee per pet per stay.",
  },
  {
    icon: "👶",
    title: "Pack-N-Play",
    price: "Free",
    description: "Traveling with a baby? We can provide a pack-n-play crib at no extra charge. Just let us know!",
  },
];

const Services = () => {
  return (
    <Layout title="Services" description="Airport pickup, early check-in, late checkout, pet accommodations, and more at Evergreen Cottages.">
      {/* Header */}
      <div className="bg-evergreen-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Services & Add-ons</h1>
          <p className="text-evergreen-100 max-w-xl mx-auto">
            Make your stay even better with our additional services.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.title} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{service.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.title}</h3>
              <p className="text-evergreen-600 font-medium text-sm mb-3">{service.price}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 bg-gray-50 rounded-2xl p-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Interested in any of these?</h2>
          <p className="text-gray-500 mb-6">Call or text us and we'll take care of everything.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+15108227060" className="bg-evergreen-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-evergreen-700 transition-colors">
              Call (510) 822-7060
            </a>
            <a href="sms:+15108227060" className="border-2 border-evergreen-600 text-evergreen-700 px-8 py-3 rounded-lg font-semibold hover:bg-evergreen-50 transition-colors">
              Text Us
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Services;
