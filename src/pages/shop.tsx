import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import CartDrawer from "../components/CartDrawer";
import { useCart } from "../lib/useCart";
import {
  CATALOG,
  CATEGORIES,
  FL_ALCOHOL_DISCLAIMER,
  type DrinkCategory,
  type DrinkItem,
} from "../lib/shop-catalog";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function ProductCard({
  item,
  cartQty,
  onAdd,
}: {
  item: DrinkItem;
  cartQty: number;
  onAdd: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-sand-100 p-5 flex flex-col card-lift transition-shadow">
      {/* Category color bar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold text-sand-400 uppercase tracking-wider">
          {item.size}
        </span>
        {item.featured && (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            Guest Favorite
          </span>
        )}
      </div>

      <h3 className="font-serif text-lg text-ocean-900 mb-1">{item.name}</h3>

      {item.taste.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {item.taste.map((t) => (
            <span key={t} className="text-[10px] bg-sand-50 text-sand-500 px-2 py-0.5 rounded-full">
              {t}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-sand-500 leading-relaxed mb-4 flex-1">{item.description}</p>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-lg font-bold text-ocean-900">{formatPrice(item.priceInCents)}</span>
        <button
          onClick={() => onAdd(item.id)}
          disabled={cartQty >= item.maxQuantity}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            cartQty > 0
              ? "bg-ocean-50 text-ocean-600 border border-ocean-200"
              : "bg-ocean-500 text-white hover:bg-ocean-600"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {cartQty > 0 ? `In Cart (${cartQty})` : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const router = useRouter();
  const cart = useCart();
  const [activeCategory, setActiveCategory] = useState<DrinkCategory | "all">("all");
  const [guestName, setGuestName] = useState("");
  const [unitLabel, setUnitLabel] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checking, setChecking] = useState(false);

  // Auto-fill from token if present
  useEffect(() => {
    const token = router.query.token;
    if (typeof token === "string" && token) {
      fetch(`/api/shop-guest?token=${encodeURIComponent(token)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) {
            setGuestName(data.guestName || "");
            setPropertyName(data.propertyName || "");
            setUnitLabel(data.unitLabel || "");
          }
        })
        .catch(() => {});
    }
    // Pre-fill from query params
    if (typeof router.query.property === "string") setPropertyName(router.query.property);
    if (typeof router.query.unit === "string") setUnitLabel(router.query.unit);
  }, [router.query]);

  const filteredItems =
    activeCategory === "all" ? CATALOG : CATALOG.filter((item) => item.category === activeCategory);

  const getCartQty = (itemId: string) => {
    const entry = cart.items.find((e) => e.itemId === itemId);
    return entry ? entry.quantity : 0;
  };

  const handleCheckout = async (deliveryPref: string, scheduledTime: string) => {
    setChecking(true);
    try {
      const res = await fetch("/api/shop-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          guestName,
          propertyName,
          unitLabel,
          deliveryPref,
          scheduledTime,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Checkout failed");
        setChecking(false);
      }
    } catch {
      alert("Connection error. Please try again.");
      setChecking(false);
    }
  };

  return (
    <Layout title="Drinks & More" description="Same-day alcohol delivery to your Evergreen Cottage">
      {/* Hero */}
      <section className="bg-ocean-900 text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Drinks Delivered to Your Door</h1>
          <p className="text-ocean-200 text-lg max-w-2xl mx-auto">
            Wine, spirits, beer, and cocktail essentials — delivered same-day to your cottage from Total Wine Pensacola.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10">
        {/* Guest info bar */}
        <div className="bg-white rounded-2xl border border-sand-100 p-4 mb-8 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 min-w-0">
            <label className="text-xs text-sand-400 font-semibold block mb-1">Your Name</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Guest name"
              className="w-full border border-sand-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ocean-400"
            />
          </div>
          <div className="w-full sm:w-32">
            <label className="text-xs text-sand-400 font-semibold block mb-1">Unit #</label>
            <input
              type="text"
              value={unitLabel}
              onChange={(e) => setUnitLabel(e.target.value)}
              placeholder="e.g. 5"
              className="w-full border border-sand-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ocean-400"
            />
          </div>
          {propertyName && (
            <div className="text-xs text-sand-400 py-2">{propertyName}</div>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-1 px-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              activeCategory === "all"
                ? "bg-ocean-500 text-white"
                : "bg-white border border-sand-200 text-sand-500 hover:bg-sand-50"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? "bg-ocean-500 text-white"
                  : "bg-white border border-sand-200 text-sand-500 hover:bg-sand-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Category sections */}
        {activeCategory === "all" ? (
          CATEGORIES.map((cat) => {
            const catItems = CATALOG.filter((item) => item.category === cat.id);
            return (
              <div key={cat.id} className="mb-10">
                <div className="mb-4">
                  <h2 className="text-2xl font-serif text-ocean-900">{cat.label}</h2>
                  <p className="text-sm text-sand-400">{cat.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catItems.map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      cartQty={getCartQty(item.id)}
                      onAdd={cart.addItem}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                cartQty={getCartQty(item.id)}
                onAdd={cart.addItem}
              />
            ))}
          </div>
        )}

        {/* FL Disclaimer */}
        <div className="border-t border-sand-100 pt-6 mb-10">
          <p className="text-[10px] text-sand-400 leading-relaxed max-w-3xl">
            {FL_ALCOHOL_DISCLAIMER}
          </p>
          <p className="text-[10px] text-sand-400 mt-2">
            A $10.00 service & delivery fee is added to each order.
          </p>
        </div>
      </div>

      {/* Sticky cart bar */}
      {cart.itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-sand-200 shadow-lg px-5 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ocean-900">
                {cart.itemCount} item{cart.itemCount !== 1 ? "s" : ""} — {formatPrice(cart.total)}
              </p>
              <p className="text-[10px] text-sand-400">Includes $10 service fee</p>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="bg-ocean-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-ocean-600 transition"
            >
              View Cart
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        items={cart.items}
        subtotal={cart.subtotal}
        serviceFee={cart.serviceFee}
        total={cart.total}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
        onCheckout={handleCheckout}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        checking={checking}
        guestName={guestName}
        unitLabel={unitLabel}
      />
    </Layout>
  );
}
