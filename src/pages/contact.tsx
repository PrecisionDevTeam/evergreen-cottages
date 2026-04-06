import { useState } from "react";
import Layout from "../components/Layout";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Website Contact: ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:hello@staywithprecision.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <Layout title="Contact" description="Contact Evergreen Cottages. Call, text, or email anytime.">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 py-20">
        <p className="text-coral-500 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Get in Touch</p>
        <h1 className="text-4xl md:text-5xl font-serif text-ocean-500 mb-10">Contact Us</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-sand-100 space-y-6">
            <div>
              <div className="text-xs text-sand-400 uppercase tracking-widest mb-1">Phone</div>
              <a href="tel:+15108227060" className="text-xl font-serif text-ocean-500 hover:text-coral-500 transition-colors">
                (510) 822-7060
              </a>
              <p className="text-xs text-sand-400 mt-0.5">Call or text 24/7</p>
            </div>
            <div>
              <div className="text-xs text-sand-400 uppercase tracking-widest mb-1">Email</div>
              <a href="mailto:hello@staywithprecision.com" className="text-lg text-ocean-500 hover:text-coral-500 transition-colors">
                hello@staywithprecision.com
              </a>
            </div>
            <div>
              <div className="text-xs text-sand-400 uppercase tracking-widest mb-1">Address</div>
              <p className="text-ocean-600 font-medium">3801 Mobile Highway<br />Pensacola, FL 32505</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-sand-100">
            <h2 className="text-lg font-serif text-ocean-500 mb-6">Send a Message</h2>
            {sent ? (
              <div className="text-center py-10">
                <svg className="w-12 h-12 text-evergreen-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-serif text-ocean-500 text-lg">Message sent!</p>
                <p className="text-sand-500 text-sm mt-1">We&apos;ll get back to you soon.</p>
                <button onClick={() => setSent(false)} className="text-coral-500 text-sm mt-4 hover:underline">Send another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-ocean-600 block mb-1">Name</label>
                  <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm bg-sand-50 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-ocean-600 block mb-1">Email</label>
                  <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm bg-sand-50 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all" placeholder="your@email.com" />
                </div>
                <div>
                  <label htmlFor="msg" className="text-sm font-medium text-ocean-600 block mb-1">Message</label>
                  <textarea id="msg" rows={4} required value={message} onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm bg-sand-50 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all resize-none" placeholder="How can we help?" />
                </div>
                <button type="submit" className="w-full bg-ocean-500 text-white py-3.5 rounded-xl font-semibold hover:bg-ocean-600 transition-all">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
