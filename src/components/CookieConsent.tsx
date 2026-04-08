import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "ec_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(CONSENT_KEY, "dismissed");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-ocean-800 text-white z-50 px-5 py-4 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-white/80 text-center sm:text-left">
          We use cookies to improve your experience. By continuing to browse, you agree to our{" "}
          <Link href="/privacy" className="text-white underline hover:text-coral-400">
            Privacy Policy
          </Link>.
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={accept}
            className="bg-white text-ocean-700 px-5 py-2 rounded-full text-sm font-semibold hover:bg-sand-100 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={dismiss}
            className="text-white/60 text-sm hover:text-white transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
