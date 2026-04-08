import { useState } from "react";
import Layout from "../components/Layout";
import Breadcrumbs from "../components/Breadcrumbs";

const AMOUNTS = [50, 100, 150, 200, 250, 500];

export default function GiftCards() {
  const [amount, setAmount] = useState(100);
  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/gift-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, senderName, recipientName, message }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Checkout failed");
      }
    } catch (err) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : "Something went wrong";
      alert(`Error: ${msg}. Please call (510) 822-7060.`);
    }
  };

  return (
    <Layout title="Gift Cards" description="Give the gift of a Pensacola vacation. Evergreen Cottages gift cards from $50.">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 lg:px-10 py-20">
        <Breadcrumbs items={[{ label: "Gift Cards" }]} />
        <p className="text-coral-500 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Give a Stay</p>
        <h1 className="text-4xl md:text-5xl font-serif text-ocean-500 mb-4">Gift Cards</h1>
        <p className="text-sand-500 mb-10">Give someone a vacation in Pensacola. Redeemable at any Evergreen Cottages unit.</p>

        <div className="bg-white border border-sand-100 rounded-2xl p-8">
          {/* Amount selector */}
          <label className="text-sm font-medium text-ocean-600 block mb-3">Select amount</label>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                  amount === a
                    ? "bg-ocean-500 text-white"
                    : "bg-sand-50 text-sand-600 border border-sand-200 hover:border-ocean-500"
                }`}
              >
                ${a}
              </button>
            ))}
          </div>

          {/* Optional fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="sender" className="text-sm font-medium text-ocean-600 block mb-1">Your name</label>
              <input
                id="sender"
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="From..."
                className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm bg-sand-50 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="recipient" className="text-sm font-medium text-ocean-600 block mb-1">Recipient&apos;s name</label>
              <input
                id="recipient"
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="For..."
                className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm bg-sand-50 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="giftMessage" className="text-sm font-medium text-ocean-600 block mb-1">Personal message (optional)</label>
              <textarea
                id="giftMessage"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enjoy your stay in Pensacola!"
                className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm bg-sand-50 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none resize-none"
              />
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full bg-ocean-500 text-white py-3.5 rounded-xl font-semibold hover:bg-ocean-600 transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : `Purchase $${amount} Gift Card`}
          </button>
          <p className="text-center text-xs text-sand-400 mt-3">Delivered via email. Redeemable by contacting us.</p>
        </div>
      </div>
    </Layout>
  );
}
