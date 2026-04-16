import { useState } from "react";
import Layout from "../components/Layout";

const STARS = [1, 2, 3, 4, 5];

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-gray-800 mb-2">{label}</label>
      <div className="flex gap-2">
        {STARS.map((s) => (
          <button key={s} type="button" onClick={() => onChange(s)}
            className={`w-10 h-10 rounded-lg text-lg transition-all ${
              s <= value ? "bg-yellow-400 text-white shadow-sm" : "bg-gray-100 text-gray-300 hover:bg-gray-200"
            }`}>
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

function YesNo({ value, onChange, label, desc }: { value: string; onChange: (v: string) => void; label: string; desc?: string }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
      {desc && <p className="text-sm text-gray-500 mb-3">{desc}</p>}
      <div className="flex gap-3">
        {["Yes", "No"].map((opt) => (
          <button key={opt} type="button" onClick={() => onChange(opt.toLowerCase())}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
              value === opt.toLowerCase() ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

const SHOP_ITEMS = [
  "Welcome snack basket", "Wine & cheese board", "Birthday cake/balloons",
  "Beach towels & sunscreen", "Coffee & tea set", "Cozy blanket & pillow",
  "Board games & cards", "Bath bomb & candle set", "Baby essentials (crib sheets, wipes)",
  "Pet welcome kit (treats, bowl, mat)",
];

export default function Survey() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [property, setProperty] = useState("");
  const [overall, setOverall] = useState(0);
  const [cleanliness, setCleanliness] = useState(0);
  const [checkin, setCheckin] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [traveledFrom, setTraveledFrom] = useState("");
  const [whatLiked, setWhatLiked] = useState("");
  const [whatDifferent, setWhatDifferent] = useState("");
  const [bookDirect, setBookDirect] = useState("");
  const [airportPickup, setAirportPickup] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [usedLaundry, setUsedLaundry] = useState("");
  const [washFold, setWashFold] = useState("");
  const [washFoldPrice, setWashFoldPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [birthday, setBirthday] = useState("");
  const [giftCardEmail, setGiftCardEmail] = useState("");
  const [giftCardType, setGiftCardType] = useState("amazon");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const toggleItem = (item: string) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing: string[] = [];
    if (!name.trim()) missing.push("Name");
    if (!email.trim()) missing.push("Email");
    if (!property.trim()) missing.push("Unit");
    if (!overall) missing.push("Overall rating");
    if (!cleanliness) missing.push("Cleanliness rating");
    if (!checkin) missing.push("Check-in rating");
    if (!valueRating) missing.push("Value rating");
    if (!traveledFrom.trim()) missing.push("Where you traveled from");
    if (!whatLiked.trim()) missing.push("What you liked");
    if (!bookDirect) missing.push("Book direct question");
    if (!airportPickup) missing.push("Airport pickup question");
    if (!usedLaundry) missing.push("Laundry question");
    if (!washFold) missing.push("Wash & fold question");
    if (!discount) missing.push("Discount preference");
    if (missing.length > 0) {
      setError("Please complete: " + missing.join(", "));
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, email, phone, property,
        overall, cleanliness, checkin, value: valueRating,
        traveledFrom, whatLiked, whatDifferent,
        bookDirect, airportPickup: airportPickup === "yes",
        wouldBuyItems: selectedItems.length > 0 ? selectedItems.join(", ") : "nothing",
        usedLaundry: usedLaundry === "yes",
        washFold: washFold === "yes", washFoldPrice,
        discount, birthday,
        giftCardEmail: giftCardEmail || email,
        giftCardType,
      }),
    });

    if (res.ok) setSubmitted(true);
    else setError("Something went wrong. Please try again.");
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <Layout title="Thank You!">
        <div className="max-w-lg mx-auto py-20 px-6 text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Thank you!</h1>
          <p className="text-gray-600 mb-6">
            Your feedback helps us improve. If you are one of the first 100 respondents,
            you will receive a ${giftCardType === "starbucks" ? "Starbucks" : "Amazon"} gift card at the email you provided.
          </p>
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
            <p className="text-teal-800 font-semibold mb-2">Book direct next time and save!</p>
            <p className="text-sm text-teal-600 mb-3">
              Skip the Airbnb/VRBO fees. Book at our website for the best rates + exclusive perks.
            </p>
            <a href="/" className="inline-block bg-teal-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-teal-700 transition">
              Browse Properties
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Guest Survey">
      <div className="max-w-lg mx-auto py-12 px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">How was your stay?</h1>
          <p className="text-gray-500">
            Share your experience and help us improve. Complete the survey for a chance to receive a <strong>$10 gift card</strong>!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* About You */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">About You</h2>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Which unit did you stay at? *</label>
              <input type="text" value={property} onChange={(e) => setProperty(e.target.value)} placeholder="e.g. Unit 12"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Where did you travel from? *</label>
              <input type="text" value={traveledFrom} onChange={(e) => setTraveledFrom(e.target.value)} placeholder="e.g. Atlanta, GA"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
            </div>
          </div>

          {/* Ratings */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Rate Your Experience</h2>
            <StarRating label="Overall Experience *" value={overall} onChange={setOverall} />
            <StarRating label="Cleanliness *" value={cleanliness} onChange={setCleanliness} />
            <StarRating label="Check-in Process *" value={checkin} onChange={setCheckin} />
            <StarRating label="Value for Money *" value={valueRating} onChange={setValueRating} />
          </div>

          {/* Open-ended */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">What did you like most about your stay? *</label>
              <textarea rows={2} value={whatLiked} onChange={(e) => setWhatLiked(e.target.value)} placeholder="Tell us what you enjoyed..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">What do you wish was different?</label>
              <textarea rows={2} value={whatDifferent} onChange={(e) => setWhatDifferent(e.target.value)} placeholder="Any suggestions for improvement..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-teal-500" />
            </div>
          </div>

          {/* Direct Booking */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Would you book directly with us next time? *</h3>
            <p className="text-sm text-gray-500 mb-3">Direct guests get lower prices, flexible check-in, and exclusive perks.</p>
            <div className="flex gap-3">
              {["Yes", "Maybe", "No"].map((opt) => (
                <button key={opt} type="button" onClick={() => setBookDirect(opt.toLowerCase())}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                    bookDirect === opt.toLowerCase() ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>{opt}</button>
              ))}
            </div>
          </div>

          {/* Airport Pickup */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <YesNo value={airportPickup} onChange={setAirportPickup}
              label="If we offered airport pickup/drop-off for $25, would you use it? *"
              desc="Convenient door-to-door service from Pensacola airport to your unit." />
          </div>

          {/* Pre-arrival Shopping */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">If we offered items for delivery to your room before you arrive, what would you buy?</h3>
            <p className="text-sm text-gray-500 mb-3">Select all that interest you, or none if not interested.</p>
            <div className="space-y-2">
              {SHOP_ITEMS.map((item) => (
                <button key={item} type="button" onClick={() => toggleItem(item)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition flex items-center gap-2 ${
                    selectedItems.includes(item) ? "bg-teal-50 border border-teal-300 text-teal-800" : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                    selectedItems.includes(item) ? "bg-teal-600" : "bg-gray-200"
                  }`}>
                    {selectedItems.includes(item) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Laundry */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <YesNo value={usedLaundry} onChange={setUsedLaundry}
              label="Did you use the coin laundry machines during your stay? *" />
            <YesNo value={washFold} onChange={setWashFold}
              label="Would you pay for a wash & fold service? *"
              desc="We wash, dry, and fold your clothes and return them to your unit." />
            {washFold === "yes" && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">How much would you pay per load?</label>
                <div className="flex gap-2">
                  {["$5", "$10", "$15", "$20+"].map((p) => (
                    <button key={p} type="button" onClick={() => setWashFoldPrice(p)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                        washFoldPrice === p ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}>{p}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Discount Preference */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Which discount would you prefer for your next stay? *</h3>
            <div className="space-y-2">
              {[
                { key: "10_off_3nights", label: "10% off your next stay (3+ nights)" },
                { key: "15_off_5nights", label: "15% off your next stay (5+ nights)" },
                { key: "neither", label: "No preference" },
              ].map((opt) => (
                <button key={opt.key} type="button" onClick={() => setDiscount(opt.key)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
                    discount === opt.key ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>{opt.label}</button>
              ))}
            </div>
          </div>

          {/* Birthday */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-800 mb-1">Birthday (optional)</label>
            <p className="text-xs text-gray-500 mb-2">We will send you a special discount on your birthday!</p>
            <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
          </div>

          {/* Gift Card */}
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 space-y-3">
            <h2 className="font-semibold text-teal-800">Gift Card Reward</h2>
            <p className="text-sm text-teal-600">Complete the survey to be eligible for a $10 gift card!</p>
            <div>
              <label className="block text-sm text-teal-700 mb-1">Which do you prefer?</label>
              <div className="flex gap-3">
                {[{ key: "amazon", label: "Amazon" }, { key: "starbucks", label: "Starbucks" }].map((opt) => (
                  <button key={opt.key} type="button" onClick={() => setGiftCardType(opt.key)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                      giftCardType === opt.key ? "bg-teal-600 text-white" : "bg-white text-teal-700 border border-teal-300 hover:bg-teal-100"
                    }`}>{opt.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-teal-700 mb-1">Email to receive gift card</label>
              <input type="email" value={giftCardEmail} onChange={(e) => setGiftCardEmail(e.target.value)}
                placeholder={email || "your@email.com"}
                className="w-full border border-teal-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 bg-white" />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" disabled={submitting}
            className="w-full bg-teal-600 text-white font-semibold py-4 rounded-xl hover:bg-teal-700 transition disabled:opacity-50 text-lg">
            {submitting ? "Submitting..." : "Submit Survey"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
