import { useState } from "react";
import Layout from "../components/Layout";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Send via mailto as fallback (API route can be added later)
    const subject = encodeURIComponent(`Website Contact: ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:hello@staywithprecision.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <Layout title="Contact" description="Contact Evergreen Cottages. Call, text, or email us anytime.">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-6">Get in Touch</h2>
            <div className="space-y-5">
              <div>
                <div className="text-sm text-gray-500 mb-1">Phone</div>
                <a href="tel:+15108227060" className="text-lg font-medium text-evergreen-700 hover:underline">
                  (510) 822-7060
                </a>
                <p className="text-xs text-gray-400 mt-0.5">Call or text 24/7</p>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Email</div>
                <a href="mailto:hello@staywithprecision.com" className="text-lg font-medium text-evergreen-700 hover:underline">
                  hello@staywithprecision.com
                </a>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Address</div>
                <p className="font-medium">3801 Mobile Highway<br />Pensacola, FL 32505</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-6">Send a Message</h2>
            {sent ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-semibold text-gray-900">Message sent!</p>
                <p className="text-gray-500 text-sm mt-1">We&apos;ll get back to you as soon as possible.</p>
                <button onClick={() => setSent(false)} className="text-evergreen-600 text-sm mt-4 hover:underline">
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-1">Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-evergreen-500 focus:border-evergreen-500 outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-evergreen-500 focus:border-evergreen-500 outline-none"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="text-sm font-medium text-gray-700 block mb-1">Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-evergreen-500 focus:border-evergreen-500 outline-none"
                    placeholder="How can we help?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-evergreen-600 text-white py-3 rounded-lg font-semibold hover:bg-evergreen-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
