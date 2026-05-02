import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "../components/Layout";

type Segment = "a" | "b" | "c" | null;

const COMPLAINT_CHIPS = [
  "Cleanliness", "Noise", "Amenities", "Check-in / Check-out process",
  "Property accuracy", "Communication", "Other",
];

const SHOP_ITEMS = [
  "Welcome snack basket", "Wine & cheese board", "Birthday cake/balloons",
  "Beach towels & sunscreen", "Coffee & tea set", "Cozy blanket & pillow",
  "Board games & cards", "Bath bomb & candle set", "Baby essentials (crib sheets, wipes)",
  "Pet welcome kit (treats, bowl, mat)",
];

function StarRow({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-3 justify-center mt-6">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s} type="button" onClick={() => onChange(s)}
          className={`w-14 h-14 rounded-2xl text-2xl transition-all duration-150 ${
            s <= value ? "bg-yellow-400 shadow-md scale-110" : "bg-gray-100 text-gray-300 hover:bg-gray-200"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function OptionRow({ options, value, onChange }: { options: { key: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-3 mt-6">
      {options.map((opt) => (
        <button
          key={opt.key} type="button" onClick={() => onChange(opt.key)}
          className={`w-full py-4 px-5 rounded-2xl text-left font-medium text-base transition-all duration-150 border-2 ${
            value === opt.key
              ? "border-teal-500 bg-teal-50 text-teal-800"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, multiline }: {
  value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean;
}) {
  const cls = "w-full mt-6 border-2 border-gray-200 rounded-2xl px-4 py-4 text-base focus:outline-none focus:border-teal-500 resize-none transition";
  return multiline
    ? <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
    : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />;
}

function ChipGrid({ options, selected, onToggle }: {
  options: string[]; selected: string[]; onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-6">
      {options.map((opt) => (
        <button
          key={opt} type="button" onClick={() => onToggle(opt)}
          className={`px-4 py-2.5 rounded-full text-sm font-medium border-2 transition-all duration-150 ${
            selected.includes(opt)
              ? "border-red-400 bg-red-50 text-red-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function RatingGroup({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-5">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <div className="flex gap-2 mt-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} type="button" onClick={() => onChange(s)}
            className={`w-11 h-11 rounded-xl text-lg transition-all ${
              s <= value ? "bg-yellow-400 shadow-sm scale-105" : "bg-gray-100 text-gray-300 hover:bg-gray-200"
            }`}
          >★</button>
        ))}
      </div>
    </div>
  );
}

export default function Survey() {
  const [screen, setScreen] = useState(0);
  const [direction, setDirection] = useState(1);
  const [segment, setSegment] = useState<Segment>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Screen 0 — identity
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [property, setProperty] = useState("");

  // Screen 1 — overall rating
  const [overall, setOverall] = useState(0);

  // Screen 2 — sub-ratings
  const [cleanliness, setCleanliness] = useState(0);
  const [checkin, setCheckin] = useState(0);
  const [valueRating, setValueRating] = useState(0);

  // Screen 3 — traveled from
  const [traveledFrom, setTraveledFrom] = useState("");

  // Segment A screens
  const [highlight, setHighlight] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState("");
  const [referralEmail, setReferralEmail] = useState("");
  const [shopItems, setShopItems] = useState<string[]>([]);

  // Segment B screens
  const [whatDidWell, setWhatDidWell] = useState("");
  const [fiveStarImprovement, setFiveStarImprovement] = useState("");
  const [returnIntent, setReturnIntent] = useState("");
  const [preferredDiscount, setPreferredDiscount] = useState("");

  // Segment C screens
  const [complaintChips, setComplaintChips] = useState<string[]>([]);
  const [complaintDetail, setComplaintDetail] = useState("");
  const [wantsCallback, setWantsCallback] = useState("");

  // Gift card (all)
  const [giftCardType, setGiftCardType] = useState("amazon");
  const [giftCardEmail, setGiftCardEmail] = useState("");

  const deriveSegment = (rating: number): Segment => {
    if (rating === 5) return "a";
    if (rating >= 3) return "b";
    return "c";
  };

  // Screen sequence per segment
  const getScreens = (seg: Segment) => {
    const base = [0, 1, 2, 3]; // identity, overall, sub-ratings, traveled from
    const a = [4, 5, 6, 7];    // highlight, recommend, referral, shop
    const b = [8, 9, 10, 11];  // did well, 5-star, return intent, discount
    const c = [12, 13, 14];    // chips, detail, callback
    const gift = [15];
    if (!seg) return [...base, ...gift];
    if (seg === "a") return [...base, ...a, ...gift];
    if (seg === "b") return [...base, ...b, ...gift];
    return [...base, ...c, ...gift];
  };

  const screens = getScreens(segment);
  const currentIdx = screens.indexOf(screen);
  const totalScreens = screens.length;
  const progress = Math.round(((currentIdx + 1) / totalScreens) * 100);

  const advance = () => {
    if (currentIdx < totalScreens - 1) {
      setDirection(1);
      setScreen(screens[currentIdx + 1]);
    }
  };

  const goBack = () => {
    if (currentIdx > 0) {
      setDirection(-1);
      setScreen(screens[currentIdx - 1]);
    }
  };

  const canAdvance = (): boolean => {
    switch (screen) {
      case 0: return !!name.trim() && !!email.trim() && !!property.trim();
      case 1: return overall > 0;
      case 2: return cleanliness > 0 && checkin > 0 && valueRating > 0;
      case 3: return !!traveledFrom.trim();
      case 4: return !!highlight.trim();
      case 5: return !!wouldRecommend;
      case 8: return !!whatDidWell.trim();
      case 9: return !!fiveStarImprovement.trim();
      case 10: return !!returnIntent;
      case 11: return !!preferredDiscount;
      case 12: return complaintChips.length > 0;
      case 13: return !!complaintDetail.trim();
      case 14: return !!wantsCallback;
      default: return true;
    }
  };

  const handleNext = () => {
    if (screen === 1 && overall > 0) {
      const seg = deriveSegment(overall);
      setSegment(seg);
    }
    advance();
  };

  const toggleShopItem = (item: string) =>
    setShopItems((prev) => prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]);

  const toggleChip = (chip: string) =>
    setComplaintChips((prev) => prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email address.");
      setSubmitting(false);
      return;
    }

    const gcEmail = giftCardEmail.trim() || email;
    const payload = {
      name, email, phone, property,
      overall, cleanliness, checkin, value: valueRating,
      traveledFrom,
      segment,
      // Segment A
      highlight: segment === "a" ? highlight : undefined,
      wouldRecommend: segment === "a" ? wouldRecommend : undefined,
      referralEmail: segment === "a" && referralEmail.trim() ? referralEmail.trim() : undefined,
      wouldBuyItems: segment === "a" ? (shopItems.length > 0 ? shopItems.join(", ") : "nothing") : undefined,
      // Segment B
      whatLiked: segment === "b" ? whatDidWell : undefined,
      fiveStarImprovement: segment === "b" ? fiveStarImprovement : undefined,
      returnIntent: segment === "b" ? returnIntent : undefined,
      preferredDiscount: segment === "b" ? preferredDiscount : undefined,
      // Segment C
      complaintCategories: segment === "c" ? complaintChips.join(", ") : undefined,
      complaintDetail: segment === "c" ? complaintDetail : undefined,
      wantsCallback: segment === "c" ? wantsCallback === "yes" : undefined,
      // Gift card
      giftCardType,
      giftCardEmail: gcEmail,
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
      setError(data.error || "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  if (submitted) {
    const isDetractor = segment === "c";
    return (
      <Layout title="Thank You!">
        <div className="max-w-lg mx-auto py-20 px-6 text-center">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {isDetractor ? "Thank you for your honesty" : "Thank you!"}
          </h1>
          <p className="text-gray-500 mb-8 text-lg">
            {isDetractor
              ? "We take every piece of feedback seriously. A member of our team will be in touch shortly."
              : `Your ${giftCardType === "starbucks" ? "Starbucks" : "Amazon"} gift card will be sent to ${giftCardEmail || email} if you're one of the first 100 respondents.`}
          </p>
          {!isDetractor && (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
              <p className="text-teal-800 font-semibold mb-2">Book direct next time and save!</p>
              <p className="text-sm text-teal-600 mb-4">Skip Airbnb fees. Best rates + exclusive perks on our site.</p>
              <a href="/" className="inline-block bg-teal-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-700 transition">
                Browse Properties
              </a>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  const renderScreen = () => {
    switch (screen) {
      case 0:
        return (
          <ScreenWrap title="Tell us about yourself" subtitle="Just the basics — we'll keep this short.">
            <div className="space-y-4 mt-6">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-base focus:outline-none focus:border-teal-500 transition" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email *"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-base focus:outline-none focus:border-teal-500 transition" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-base focus:outline-none focus:border-teal-500 transition" />
              <input type="text" value={property} onChange={(e) => setProperty(e.target.value)} placeholder="Which unit? (e.g. Unit 12) *"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-base focus:outline-none focus:border-teal-500 transition" />
            </div>
          </ScreenWrap>
        );

      case 1:
        return (
          <ScreenWrap title="How was your overall stay?" subtitle="Be honest — this helps us improve.">
            <StarRow value={overall} onChange={setOverall} />
            {overall > 0 && (
              <p className="text-center mt-4 text-gray-500 text-sm">
                {["", "We're sorry to hear that.", "We can do better.", "Good, thanks!", "Great!", "Amazing — thank you!"][overall]}
              </p>
            )}
          </ScreenWrap>
        );

      case 2:
        return (
          <ScreenWrap title="A few more ratings" subtitle="How did we do on the details?">
            <div className="mt-6">
              <RatingGroup label="Cleanliness *" value={cleanliness} onChange={setCleanliness} />
              <RatingGroup label="Check-in process *" value={checkin} onChange={setCheckin} />
              <RatingGroup label="Value for money *" value={valueRating} onChange={setValueRating} />
            </div>
          </ScreenWrap>
        );

      case 3:
        return (
          <ScreenWrap title="Where did you travel from?" subtitle="">
            <TextInput value={traveledFrom} onChange={setTraveledFrom} placeholder="e.g. Atlanta, GA" />
          </ScreenWrap>
        );

      // Segment A
      case 4:
        return (
          <ScreenWrap title="What was the highlight of your stay?" subtitle="">
            <TextInput value={highlight} onChange={setHighlight} placeholder="The thing you'll remember most..." multiline />
          </ScreenWrap>
        );

      case 5:
        return (
          <ScreenWrap title="Would you recommend us to friends or family?" subtitle="">
            <OptionRow
              value={wouldRecommend}
              onChange={setWouldRecommend}
              options={[
                { key: "yes", label: "Yes, absolutely" },
                { key: "already", label: "Already have!" },
                { key: "no", label: "Not yet" },
              ]}
            />
          </ScreenWrap>
        );

      case 6:
        return (
          <ScreenWrap title="Refer a friend" subtitle="They'll get 10% off their first stay. You'll get a $10 credit.">
            <TextInput value={referralEmail} onChange={setReferralEmail} placeholder="Friend's email (optional)" />
          </ScreenWrap>
        );

      case 7:
        return (
          <ScreenWrap title="Pre-arrival shop" subtitle="Which items would you want delivered to your room before you arrive?">
            <div className="flex flex-wrap gap-2 mt-6">
              {SHOP_ITEMS.map((item) => (
                <button key={item} type="button" onClick={() => toggleShopItem(item)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium border-2 transition-all duration-150 ${
                    shopItems.includes(item)
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">Skip if not interested — tap any that appeal to you.</p>
          </ScreenWrap>
        );

      // Segment B
      case 8:
        return (
          <ScreenWrap title="What did we do well?" subtitle="">
            <TextInput value={whatDidWell} onChange={setWhatDidWell} placeholder="We'd love to hear what worked..." multiline />
          </ScreenWrap>
        );

      case 9:
        return (
          <ScreenWrap title="What would have made it a 5-star stay?" subtitle="Your honest answer helps us improve.">
            <TextInput value={fiveStarImprovement} onChange={setFiveStarImprovement} placeholder="One thing that would have made it perfect..." multiline />
          </ScreenWrap>
        );

      case 10:
        return (
          <ScreenWrap title="Would you give us another chance?" subtitle="">
            <OptionRow
              value={returnIntent}
              onChange={setReturnIntent}
              options={[
                { key: "yes", label: "Yes, I'd book again" },
                { key: "maybe", label: "Maybe, with improvements" },
                { key: "no", label: "Probably not" },
              ]}
            />
          </ScreenWrap>
        );

      case 11:
        return (
          <ScreenWrap title="Which discount would you prefer for your next stay?" subtitle="">
            <OptionRow
              value={preferredDiscount}
              onChange={setPreferredDiscount}
              options={[
                { key: "10_off_3nights", label: "10% off (3+ nights)" },
                { key: "15_off_5nights", label: "15% off (5+ nights)" },
                { key: "neither", label: "No preference" },
              ]}
            />
          </ScreenWrap>
        );

      // Segment C
      case 12:
        return (
          <ScreenWrap title="What went wrong?" subtitle="Select everything that applies.">
            <ChipGrid options={COMPLAINT_CHIPS} selected={complaintChips} onToggle={toggleChip} />
          </ScreenWrap>
        );

      case 13:
        return (
          <ScreenWrap title="What would have made it right?" subtitle="We want to understand what we could have done differently.">
            <TextInput value={complaintDetail} onChange={setComplaintDetail} placeholder="Tell us more..." multiline />
          </ScreenWrap>
        );

      case 14:
        return (
          <ScreenWrap title="Would you like our manager to reach out?" subtitle="We'd like the opportunity to make this right.">
            <OptionRow
              value={wantsCallback}
              onChange={setWantsCallback}
              options={[
                { key: "yes", label: "Yes, please reach out" },
                { key: "no", label: "No thanks" },
              ]}
            />
          </ScreenWrap>
        );

      case 15:
        return (
          <ScreenWrap
            title={segment === "c" ? "One last thing" : "Claim your gift card"}
            subtitle={
              segment === "c"
                ? "Complete this to be eligible if we run a future gift card offer."
                : "Complete the survey to be eligible for a $10 gift card (first 100 respondents)."
            }
          >
            <div className="mt-6 space-y-4">
              <div className="flex gap-3">
                {[{ key: "amazon", label: "Amazon" }, { key: "starbucks", label: "Starbucks" }].map((opt) => (
                  <button key={opt.key} type="button" onClick={() => setGiftCardType(opt.key)}
                    className={`flex-1 py-4 rounded-2xl text-base font-medium border-2 transition-all duration-150 ${
                      giftCardType === opt.key
                        ? "border-teal-500 bg-teal-50 text-teal-800"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <input
                type="email"
                value={giftCardEmail}
                onChange={(e) => setGiftCardEmail(e.target.value)}
                placeholder={email || "Email for gift card"}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-base focus:outline-none focus:border-teal-500 transition"
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-teal-600 text-white font-semibold py-5 rounded-2xl hover:bg-teal-700 transition disabled:opacity-50 text-lg mt-2"
              >
                {submitting ? "Submitting..." : "Submit Survey"}
              </button>
            </div>
          </ScreenWrap>
        );

      default:
        return null;
    }
  };

  return (
    <Layout title="Guest Survey">
      <div className="max-w-lg mx-auto px-6 py-8 min-h-screen flex flex-col">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400 font-medium">
              {currentIdx + 1} of {totalScreens}
            </span>
            <span className="text-xs text-gray-400 font-medium">{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Screen */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={screen}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {screen !== 15 && (
          <div className="mt-8 flex gap-3">
            {currentIdx > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="px-6 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-medium hover:border-gray-300 transition"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance()}
              className="flex-1 py-4 rounded-2xl bg-teal-600 text-white font-semibold text-lg hover:bg-teal-700 transition disabled:opacity-40"
            >
              {currentIdx === totalScreens - 2 ? "Almost done →" : "Next →"}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

function ScreenWrap({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h2>
      {subtitle && <p className="text-gray-500 mt-2 text-base">{subtitle}</p>}
      {children}
    </div>
  );
}
