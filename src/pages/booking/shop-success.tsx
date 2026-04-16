import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { getItemById } from "../../lib/shop-catalog";

type OrderItem = { itemId: string; name: string; quantity: number; priceInCents: number };

export default function ShopSuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;
  const [items, setItems] = useState<OrderItem[]>([]);
  const [delivery, setDelivery] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Clear cart on success
    try { localStorage.removeItem("ec-shop-cart"); } catch {}

    // Parse order from URL params (set by Stripe redirect metadata isn't available client-side)
    // We'll show a generic success. Full receipt comes via Stripe email.
  }, []);

  return (
    <Layout title="Order Confirmed" description="Your drinks order has been placed">
      <div className="min-h-[60vh] flex items-center justify-center px-5">
        <div className="max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-evergreen-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-evergreen-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-serif text-ocean-900 mb-3">Order Confirmed!</h1>
          <p className="text-sand-500 mb-6">
            Your drinks order has been placed. Our staff will fulfill it shortly.
          </p>

          <div className="bg-sand-50 rounded-2xl p-6 text-left mb-6 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-sand-400">Delivery:</span>
              <span className="text-ocean-900 font-medium">Same-day — typically within 2 hours</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-sand-400">Receipt:</span>
              <span className="text-ocean-900 font-medium">Sent to your email via Stripe</span>
            </div>
            <div className="border-t border-sand-200 pt-3 text-xs text-sand-400">
              A valid government-issued photo ID (21+) is required at delivery.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/shop")}
              className="px-6 py-2.5 bg-ocean-500 text-white rounded-lg font-semibold hover:bg-ocean-600 transition"
            >
              Continue Shopping
            </button>
            <a
              href="tel:+15108227060"
              className="px-6 py-2.5 border border-sand-200 text-sand-600 rounded-lg font-semibold hover:bg-sand-50 transition"
            >
              Questions? Call Us
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
