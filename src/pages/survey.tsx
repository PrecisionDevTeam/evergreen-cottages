import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

type Segment = "a" | "b" | "c";

type GuestData = {
  segment: Segment;
  reviewRating: number | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  unit: string | null;
  checkIn: string | null;
  checkOut: string | null;
  originCity: string | null;
  referralCode: string | null;
};

type ScreenId =
  | "intro"
  | "stood_out"
  | "one_change"
  // Survey A
  | "book_direct"
  | "discount_pref"
  | "book_direct_why"
  | "shop_items"
  | "airport_q1"
  | "airport_q2"
  | "airport_q3"
  | "laundry"
  | "wash_fold"
  | "referral"
  | "gift_card_a"
  | "birthday"
  // Survey B
  | "five_star"
  | "shop_items_b"
  | "airport_b"
  | "book_direct_b"
  | "gift_card_b"
  // Shared submit
  | "gift_card";

const SHOP_ITEMS = [
  "Welcome snack basket",
  "Wine & cheese board",
  "Birthday cake & balloons",
  "Beach towels & sunscreen",
  "Coffee & tea set",
  "Cozy blanket & pillow",
  "Board games & cards",
  "Bath bomb & candle set",
  "Baby essentials (crib sheets, wipes)",
  "Pet welcome kit (treats, bowl, mat)",
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function OptionRow({ options, value, onChange }: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 mt-6">
      {options.map((opt) => (
        <button key={opt.key} type="button" onClick={() => onChange(opt.key)}
          className={`w-full py-4 px-5 rounded-2xl text-left font-medium text-base transition-all border-2 ${
            value === opt.key
              ? "border-teal-500 bg-teal-50 text-teal-800"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
          }`}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function TextArea({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full mt-6 border-2 border-gray-200 rounded-2xl px-4 py-4 text-base focus:outline-none focus:border-teal-500 resize-none transition" />
  );
}

function ChipGrid({ options, selected, onToggle }: {
  options: string[]; selected: string[]; onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-6">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onToggle(opt)}
          className={`px-4 py-3 rounded-2xl text-sm font-medium border-2 transition-all text-left ${
            selected.includes(opt)
              ? "border-teal-500 bg-teal-50 text-teal-800"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function Wrap({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="py-2">
      <h2 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h2>
      {subtitle && <p className="text-gray-500 mt-2 text-base">{subtitle}</p>}
      {children}
    </div>
  );
}

export default function Survey() {
  const router = useRouter();
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [tokenParam, setTokenParam] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenError, setTokenError] = useState("");

  const [screen, setScreen] = useState<ScreenId>("intro");
  const [history, setHistory] = useState<ScreenId[]>([]);
  const [dir, setDir] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Shared answers
  const [stoodOut, setStoodOut] = useState("");
  const [oneChange, setOneChange] = useState("");

  // Survey A answers
  const [bookDirect, setBookDirect] = useState("");
  const [discountPref, setDiscountPref] = useState("");
  const [bookDirectWhy, setBookDirectWhy] = useState("");
  const [shopItems, setShopItems] = useState<string[]>([]);
  const [airportQ1, setAirportQ1] = useState("");
  const [airportQ2, setAirportQ2] = useState("");
  const [airportQ3, setAirportQ3] = useState("");
  const [usedLaundry, setUsedLaundry] = useState("");
  const [washFold, setWashFold] = useState("");
  const [washFoldBucket] = useState(() => [25, 35, 45][Math.floor(Math.random() * 3)]);
  const [giftCardChoice, setGiftCardChoice] = useState("");
  const [birthdayMonth, setBirthdayMonth] = useState("");
  const [birthdayDay, setBirthdayDay] = useState("");
  const [copied, setCopied] = useState(false);

  // Survey B answers
  const [fiveStarFix, setFiveStarFix] = useState("");
  const [bookDirectB, setBookDirectB] = useState("");

  // Load token data
  useEffect(() => {
    const t = router.query.t;
    if (!router.isReady) return;

    if (!t || typeof t !== "string") {
      setTokenError("This survey link is personalised. Please use the link sent to you after your stay.");
      setLoading(false);
      return;
    }

    setTokenParam(t);
    fetch(`/api/survey-token?t=${encodeURIComponent(t)}`)
      .then(async (r) => {
        const data = await r.json();
        if (r.status === 410) {
          setTokenError(
            data.error === "Survey already completed"
              ? "You've already completed this survey — thank you! Your gift card will be sent within 24 hours."
              : "This survey link has expired."
          );
          setLoading(false);
          return;
        }
        if (!r.ok || data.error) {
          setTokenError("This survey link is invalid. Please use the link sent to you after your stay.");
          setLoading(false);
          return;
        }
        setGuest(data as GuestData);
        setLoading(false);
      })
      .catch(() => {
        setTokenError("Unable to load survey. Please try again.");
        setLoading(false);
      });
  }, [router.isReady, router.query.t]);

  // Screen sequence per segment
  const screenSequence = useMemo((): ScreenId[] => {
    if (!guest) return [];
    const seg = guest.segment;
    if (seg === "a") {
      const base: ScreenId[] = ["intro", "stood_out", "one_change", "book_direct"];
      const afterBookDirect: ScreenId[] =
        bookDirect === "yes" || bookDirect === "maybe"
          ? ["discount_pref"]
          : bookDirect === "no"
          ? ["book_direct_why"]
          : [];
      const rest: ScreenId[] = ["shop_items", "airport_q1"];
      const afterAirport: ScreenId[] =
        airportQ1 === "uber_lyft" ? ["airport_q2", "airport_q3"] : ["airport_q3"];
      const final: ScreenId[] = ["laundry", "wash_fold", "referral", "gift_card", "birthday"];
      return [...base, ...afterBookDirect, ...rest, ...afterAirport, ...final];
    }
    if (seg === "b") {
      return [
        "intro", "five_star", "stood_out", "one_change",
        "shop_items_b", "airport_b", "book_direct_b", "gift_card",
      ];
    }
    // segment c — should not reach survey page (email only), but handle gracefully
    return ["intro"];
  }, [guest, bookDirect, airportQ1]);

  const currentIdx = screenSequence.indexOf(screen);
  const totalScreens = screenSequence.length;
  const progress = totalScreens > 0 ? Math.round(((currentIdx + 1) / totalScreens) * 100) : 0;

  const canAdvance = (): boolean => {
    switch (screen) {
      case "intro": return true;
      case "stood_out": return stoodOut.trim().length > 0;
      case "one_change": return oneChange.trim().length > 0;
      case "book_direct": return !!bookDirect;
      case "discount_pref": return !!discountPref;
      case "book_direct_why": return true; // optional
      case "shop_items": return true; // multi-select optional
      case "shop_items_b": return true;
      case "airport_q1": return !!airportQ1;
      case "airport_q2": return true; // optional cost
      case "airport_q3": return !!airportQ3;
      case "airport_b": return !!airportQ1;
      case "laundry": return !!usedLaundry;
      case "wash_fold": return !!washFold;
      case "referral": return true;
      case "five_star": return fiveStarFix.trim().length > 0;
      case "book_direct_b": return !!bookDirectB;
      case "gift_card": return !!giftCardChoice;
      case "birthday": return true; // optional
      default: return true;
    }
  };

  const advance = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= screenSequence.length) return;
    setDir(1);
    setHistory((h) => [...h, screen]);
    setScreen(screenSequence[nextIdx]);
  };

  const goBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setDir(-1);
    setHistory((h) => h.slice(0, -1));
    setScreen(prev);
  };

  const isFinalScreen = currentIdx === totalScreens - 1;

  const handleSubmit = async () => {
    if (!guest) return;
    setSubmitting(true);
    setSubmitError("");

    const payload = {
      token: tokenParam,
      segment: guest.segment,
      reviewRating: guest.reviewRating,
      // Pre-filled identity
      name: guest.guestName,
      email: guest.guestEmail,
      phone: guest.guestPhone,
      property: guest.unit,
      traveledFrom: guest.originCity,
      referralCode: guest.referralCode,
      // Shared
      stoodOut,
      oneChange,
      // Survey A
      bookDirect: bookDirect || undefined,
      discountPref: discountPref || undefined,
      bookDirectReason: bookDirectWhy || undefined,
      wouldBuyItems: shopItems.length > 0 ? shopItems.join(", ") : "nothing",
      airportMethod: airportQ1 || undefined,
      airportCost: airportQ2 || undefined,
      airportInterest: airportQ3 || undefined,
      usedLaundry: usedLaundry === "yes",
      washFold: washFold,
      washFoldPriceBucket: washFoldBucket,
      birthdayMonth: birthdayMonth || undefined,
      birthdayDay: birthdayDay || undefined,
      // Survey B
      fiveStarFix: fiveStarFix || undefined,
      bookDirectB: bookDirectB || undefined,
      // Gift card
      giftCardChoice,
    };

    const res = await fetch("/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setSubmitError(data.error || "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  // --- Render states ---

  if (loading) {
    return (
      <Layout title="Guest Survey">
        <div className="max-w-lg mx-auto py-32 px-6 text-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </Layout>
    );
  }

  if (tokenError) {
    return (
      <Layout title="Survey">
        <div className="max-w-lg mx-auto py-20 px-6 text-center">
          <p className="text-gray-500 text-lg">{tokenError}</p>
        </div>
      </Layout>
    );
  }

  if (!guest) return null;

  if (submitted) {
    const isCredit = giftCardChoice === "stay_credit_20";
    return (
      <Layout title="Thank You!">
        <div className="max-w-lg mx-auto py-20 px-6 text-center">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Thank you{guest.guestName ? `, ${guest.guestName.split(" ")[0]}` : ""}!</h1>
          <p className="text-gray-500 mb-8 text-lg">
            {isCredit
              ? "Your $20 stay credit has been noted. We'll apply it to your next booking."
              : `Your ${giftCardChoice === "starbucks_10" ? "Starbucks" : "Amazon"} $10 gift card will be sent within 24 hours.`}
          </p>
          {guest.referralCode && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 text-left">
              <p className="text-sm font-semibold text-gray-700 mb-1">Your referral code</p>
              <p className="text-2xl font-mono font-bold text-teal-700">{guest.referralCode}</p>
              <p className="text-xs text-gray-500 mt-1">Share with friends visiting Pensacola.</p>
            </div>
          )}
          <a href="/" className="inline-block bg-teal-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-700 transition">
            Browse Properties
          </a>
        </div>
      </Layout>
    );
  }

  const toggleShopItem = (item: string) =>
    setShopItems((prev) => prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  const firstName = guest.guestName?.split(" ")[0] ?? "there";

  const renderScreen = () => {
    switch (screen) {
      case "intro":
        return (
          <Wrap title={`Thanks for the ${guest.segment === "a" ? "5-star review" : "review"}, ${firstName}.`}
            subtitle="We wanted to ask a couple of quick questions — and send you a $10 gift card for your time.">
            {guest.unit && (
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-5 text-sm text-gray-600 space-y-1">
                <p><span className="font-medium text-gray-800">{guest.unit}</span></p>
                {(guest.checkIn || guest.checkOut) && (
                  <p>{formatDate(guest.checkIn)} – {formatDate(guest.checkOut)}</p>
                )}
                {guest.originCity && <p>Traveled from {guest.originCity}</p>}
              </div>
            )}
          </Wrap>
        );

      case "stood_out":
        return (
          <Wrap title="What's the one thing that stood out about your stay?">
            <TextArea value={stoodOut} onChange={setStoodOut} placeholder="The thing you'll remember most..." />
          </Wrap>
        );

      case "one_change":
        return (
          <Wrap title="If you could change one thing about your stay, what would it be?">
            <TextArea value={oneChange} onChange={setOneChange} placeholder="Be honest — this helps us improve." />
          </Wrap>
        );

      case "five_star":
        return (
          <Wrap title="What's the one thing that would have turned your stay into a 5-star experience?"
            subtitle="This is the most important question — please be specific.">
            <TextArea value={fiveStarFix} onChange={setFiveStarFix} placeholder="What would have made it perfect..." />
          </Wrap>
        );

      case "book_direct":
        return (
          <Wrap title="Would you book directly with us next time instead of through Airbnb/VRBO?"
            subtitle="Direct guests pay less and get flexible check-in.">
            <OptionRow value={bookDirect} onChange={setBookDirect} options={[
              { key: "yes", label: "Yes" },
              { key: "maybe", label: "Maybe" },
              { key: "no", label: "No" },
            ]} />
          </Wrap>
        );

      case "discount_pref":
        return (
          <Wrap title="Which discount would you prefer for your next stay?">
            <OptionRow value={discountPref} onChange={setDiscountPref} options={[
              { key: "10_off_3nights", label: "10% off your next stay (3+ nights)" },
              { key: "15_off_5nights", label: "15% off your next stay (5+ nights)" },
              { key: "no_preference", label: "No preference" },
            ]} />
          </Wrap>
        );

      case "book_direct_why":
        return (
          <Wrap title="What would make you more likely to book direct?" subtitle="Optional — skip if you prefer.">
            <TextArea value={bookDirectWhy} onChange={setBookDirectWhy} placeholder="e.g. price, trust, ease of booking..." />
          </Wrap>
        );

      case "book_direct_b":
        return (
          <Wrap title="Would you book directly with us next time for a lower price?">
            <OptionRow value={bookDirectB} onChange={setBookDirectB} options={[
              { key: "yes", label: "Yes" },
              { key: "maybe", label: "Maybe" },
              { key: "no", label: "No" },
            ]} />
          </Wrap>
        );

      case "shop_items":
      case "shop_items_b":
        return (
          <Wrap title="If we offered these items waiting in your unit before you arrived, which would you buy?"
            subtitle="Select any that interest you. Prices coming soon.">
            <ChipGrid options={SHOP_ITEMS} selected={shopItems} onToggle={toggleShopItem} />
            <p className="text-xs text-gray-400 mt-3">Skip if none interest you.</p>
          </Wrap>
        );

      case "airport_q1":
      case "airport_b":
        return (
          <Wrap title="On this trip, how did you get from the airport to the property?">
            <OptionRow value={airportQ1} onChange={setAirportQ1} options={[
              { key: "uber_lyft", label: "Uber / Lyft" },
              { key: "rental_car", label: "Rental car" },
              { key: "friend_family", label: "Friend or family picked me up" },
              { key: "didnt_fly", label: "Didn't fly" },
              { key: "other", label: "Other" },
            ]} />
          </Wrap>
        );

      case "airport_q2":
        return (
          <Wrap title="Roughly what did that ride cost?" subtitle="Optional — helps us price our transfer service.">
            <OptionRow value={airportQ2} onChange={setAirportQ2} options={[
              { key: "under_20", label: "Under $20" },
              { key: "20_35", label: "$20 – $35" },
              { key: "35_50", label: "$35 – $50" },
              { key: "over_50", label: "Over $50" },
              { key: "dont_remember", label: "Don't remember" },
            ]} />
          </Wrap>
        );

      case "airport_q3":
        return (
          <Wrap title="If we offered door-to-door pickup and drop-off for $25, would you have used it?">
            <OptionRow value={airportQ3} onChange={setAirportQ3} options={[
              { key: "yes_definitely", label: "Yes, definitely" },
              { key: "maybe", label: "Maybe" },
              { key: "no", label: "No" },
            ]} />
          </Wrap>
        );

      case "laundry":
        return (
          <Wrap title="Did you use the coin laundry machines during your stay?">
            <OptionRow value={usedLaundry} onChange={setUsedLaundry} options={[
              { key: "yes", label: "Yes" },
              { key: "no", label: "No" },
            ]} />
          </Wrap>
        );

      case "wash_fold":
        return (
          <Wrap
            title={`Would you pay $${washFoldBucket} for a wash & fold service?`}
            subtitle="We pick up, wash, dry, fold, and return to your unit the next day.">
            <OptionRow value={washFold} onChange={setWashFold} options={[
              { key: "yes", label: "Yes" },
              { key: "maybe", label: "Maybe" },
              { key: "no", label: "No" },
            ]} />
          </Wrap>
        );

      case "referral":
        return (
          <Wrap title="Know anyone visiting Pensacola?"
            subtitle="Share your referral code with friends. We'll reach out to them.">
            <div className="mt-6 bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 text-center">
              <p className="text-3xl font-mono font-bold text-teal-700 tracking-widest mb-3">
                {guest.referralCode ?? "—"}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (guest.referralCode) {
                    navigator.clipboard.writeText(guest.referralCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
                className="text-sm text-teal-600 font-medium underline underline-offset-2"
              >
                {copied ? "Copied!" : "Copy code"}
              </button>
            </div>
          </Wrap>
        );

      case "gift_card":
        return (
          <Wrap title="Which $10 reward would you like?"
            subtitle="Thank you for completing the survey.">
            <OptionRow value={giftCardChoice} onChange={setGiftCardChoice} options={[
              { key: "amazon_10", label: "Amazon $10 gift card" },
              { key: "starbucks_10", label: "Starbucks $10 gift card" },
              { key: "stay_credit_20", label: "$20 credit toward your next Evergreen stay" },
            ]} />
            {submitError && <p className="text-red-500 text-sm text-center mt-4">{submitError}</p>}
          </Wrap>
        );

      case "birthday":
        return (
          <Wrap title="Mind sharing your birthday?" subtitle="Returning guests may receive a little something. Month and day only — no year.">
            <div className="flex gap-3 mt-6">
              <select value={birthdayMonth} onChange={(e) => setBirthdayMonth(e.target.value)}
                className="flex-1 border-2 border-gray-200 rounded-2xl px-4 py-4 text-base focus:outline-none focus:border-teal-500 bg-white">
                <option value="">Month</option>
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={birthdayDay} onChange={(e) => setBirthdayDay(e.target.value)}
                className="w-28 border-2 border-gray-200 rounded-2xl px-4 py-4 text-base focus:outline-none focus:border-teal-500 bg-white">
                <option value="">Day</option>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </Wrap>
        );

      default:
        return null;
    }
  };

  return (
    <Layout title="Guest Survey">
      <div className="max-w-lg mx-auto px-6 py-8 min-h-screen flex flex-col">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400 font-medium">{currentIdx + 1} of {totalScreens}</span>
            <span className="text-xs text-gray-400 font-medium">{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Screen */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence custom={dir} mode="wait">
            <motion.div key={screen} custom={dir} variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}>
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {history.length > 0 && (
            <button type="button" onClick={goBack}
              className="px-6 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-medium hover:border-gray-300 transition">
              Back
            </button>
          )}
          {isFinalScreen ? (
            <button type="button" onClick={handleSubmit} disabled={!canAdvance() || submitting}
              className="flex-1 py-4 rounded-2xl bg-teal-600 text-white font-semibold text-lg hover:bg-teal-700 transition disabled:opacity-40">
              {submitting ? "Submitting..." : "Submit & claim my gift card"}
            </button>
          ) : (
            <button type="button" onClick={advance} disabled={!canAdvance()}
              className="flex-1 py-4 rounded-2xl bg-teal-600 text-white font-semibold text-lg hover:bg-teal-700 transition disabled:opacity-40">
              Next →
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
