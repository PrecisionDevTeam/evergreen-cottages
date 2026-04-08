import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const EXIT_KEY = "ec_exit_shown";
const SKIP_PATHS = ["/contact", "/booking", "/stay", "/privacy", "/terms"];

export default function ExitIntent() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Don't show on confirmation/contact/legal pages
    if (SKIP_PATHS.some((p) => router.pathname.startsWith(p))) return;
    // Don't show if already dismissed this session
    if (sessionStorage.getItem(EXIT_KEY)) return;

    // Desktop: mouse leaves viewport (moves to top)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setVisible(true);
        sessionStorage.setItem(EXIT_KEY, "1");
        document.removeEventListener("mouseout", handleMouseLeave);
      }
    };

    // Mobile: show after 30s
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem(EXIT_KEY)) {
        setVisible(true);
        sessionStorage.setItem(EXIT_KEY, "1");
      }
    }, 30000);

    document.addEventListener("mouseout", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseout", handleMouseLeave);
      clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setVisible(false)}>
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 text-sand-400 hover:text-sand-600 text-xl w-8 h-8 flex items-center justify-center"
          aria-label="Close"
        >
          &times;
        </button>

        <div className="text-4xl mb-3">🏖️</div>
        <h2 className="text-2xl font-serif text-ocean-500 mb-2">Wait — don&apos;t miss out!</h2>
        <p className="text-sand-500 text-sm mb-6">
          Book direct and save 10-15% vs Airbnb. No platform fees, 24/7 support, and keyless smart lock entry.
        </p>

        <Link
          href="/properties"
          className="block w-full bg-ocean-500 text-white py-3.5 rounded-xl font-semibold hover:bg-ocean-600 transition-colors mb-3"
          onClick={() => setVisible(false)}
        >
          Browse Properties
        </Link>
        <button
          onClick={() => setVisible(false)}
          className="text-sand-400 text-sm hover:text-sand-600 transition-colors"
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
