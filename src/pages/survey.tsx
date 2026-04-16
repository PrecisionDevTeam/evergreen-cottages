import { useState } from "react";
import Layout from "../components/Layout";

const STARS = [1, 2, 3, 4, 5];

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-800 mb-2">{label}</label>
      <div className="flex gap-2">
        {STARS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`w-10 h-10 rounded-lg text-lg transition-all ${
              s <= value
                ? "bg-yellow-400 text-white shadow-sm"
                : "bg-gray-100 text-gray-300 hover:bg-gray-200"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Survey() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [property, setProperty] = useState("");
  const [overall, setOverall] = useState(0);
  const [cleanliness, setCleanliness] = useState(0);
  const [checkin, setCheckin] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [bookDirect, setBookDirect] = useState("");
  const [usedLaundry, setUsedLaundry] = useState("");
  const [washFold, setWashFold] = useState("");
  const [washFoldPrice, setWashFoldPrice] = useState("");
  const [birthday, setBirthday] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [giftCardEmail, setGiftCardEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overall || !cleanliness) {
      setError("Please rate your overall experience and cleanliness.");
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
        bookDirect, usedLaundry: usedLaundry === "yes",
        washFold: washFold === "yes", washFoldPrice,
        birthday, suggestions, giftCardEmail: giftCardEmail || email,
      }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      setError("Something went wrong. Please try again.");
    }
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
            Your feedback helps us improve. If you&apos;re one of the first 100 respondents,
            you&apos;ll receive a $10 gift card at the email you provided.
          </p>
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 mb-6">
            <p className="text-teal-800 font-semibold mb-2">Book direct next time and save!</p>
            <p className="text-sm text-teal-600 mb-3">
              Skip the Airbnb/VRBO fees — book at our website for the best rates + exclusive perks.
            </p>
            <a
              href="/"
              className="inline-block bg-teal-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-teal-700 transition"
            >
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
          {/* Name + Contact */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">About You</h2>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone (optional)</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Which unit did you stay at?</label>
              <input type="text" value={property} onChange={(e) => setProperty(e.target.value)} placeholder="e.g. Unit 12"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
            </div>
          </div>

          {/* Ratings */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Rate Your Experience</h2>
            <StarRating label="Overall Experience" value={overall} onChange={setOverall} />
            <StarRating label="Cleanliness" value={cleanliness} onChange={setCleanliness} />
            <StarRating label="Check-in Process" value={checkin} onChange={setCheckin} />
            <StarRating label="Value for Money" value={valueRating} onChange={setValueRating} />
          </div>

          {/* Direct Booking */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Would you book directly with us next time instead of Airbnb/VRBO?</h2>
            <p className="text-sm text-gray-500 mb-3">Direct guests get lower prices, flexible check-in, and exclusive perks.</p>
            <div className="flex gap-3">
              {["Yes", "Maybe", "No"].map((opt) => (
                <button key={opt} type="button" onClick={() => setBookDirect(opt.toLowerCase())}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                    bookDirect === opt.toLowerCase()
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Laundry */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Did you use the coin laundry machines during your stay?</h2>
              <div className="flex gap-3">
                {["Yes", "No"].map((opt) => (
                  <button key={opt} type="button" onClick={() => setUsedLaundry(opt.toLowerCase())}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                      usedLaundry === opt.toLowerCase()
                        ? "bg-teal-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Would you pay for a wash & fold service if we offered it?</h2>
              <p className="text-sm text-gray-500 mb-3">We&apos;re considering offering a laundry service where we wash, dry, and fold your clothes.</p>
              <div className="flex gap-3 mb-3">
                {["Yes", "No"].map((opt) => (
                  <button key={opt} type="button" onClick={() => setWashFold(opt.toLowerCase())}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                      washFold === opt.toLowerCase()
                        ? "bg-teal-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {washFold === "yes" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">How much would you pay per load?</label>
                  <div className="flex gap-2">
                    {["$5", "$10", "$15", "$20+"].map((p) => (
                      <button key={p} type="button" onClick={() => setWashFoldPrice(p)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                          washFoldPrice === p ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Birthday + Suggestions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Birthday (optional)</label>
              <p className="text-xs text-gray-500 mb-2">We&apos;ll send you a special discount on your birthday!</p>
              <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Any suggestions or comments?</label>
              <textarea rows={3} value={suggestions} onChange={(e) => setSuggestions(e.target.value)} placeholder="What could we improve?"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-teal-500" />
            </div>
          </div>

          {/* Gift Card Email */}
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
            <h2 className="font-semibold text-teal-800 mb-2">Gift Card</h2>
            <p className="text-sm text-teal-600 mb-3">Enter your email to receive your gift card if selected:</p>
            <input type="email" value={giftCardEmail} onChange={(e) => setGiftCardEmail(e.target.value)}
              placeholder={email || "your@email.com"}
              className="w-full border border-teal-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 bg-white" />
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
