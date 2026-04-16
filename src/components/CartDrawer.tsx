import { useState } from "react";
import { getItemById, FL_ALCOHOL_DISCLAIMER, DELIVERY_OPTIONS } from "../lib/shop-catalog";

type CartEntry = { itemId: string; quantity: number };

type CartDrawerProps = {
  items: CartEntry[];
  subtotal: number;
  serviceFee: number;
  total: number;
  onUpdateQuantity: (itemId: string, qty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: (deliveryPref: string, scheduledTime: string) => void;
  isOpen: boolean;
  onClose: () => void;
  checking: boolean;
  guestName: string;
  unitLabel: string;
  onGuestNameChange: (val: string) => void;
  onUnitLabelChange: (val: string) => void;
};

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CartDrawer({
  items, subtotal, serviceFee, total,
  onUpdateQuantity, onRemoveItem, onCheckout,
  isOpen, onClose, checking, guestName, unitLabel,
  onGuestNameChange, onUnitLabelChange,
}: CartDrawerProps) {
  const [deliveryPref, setDeliveryPref] = useState("asap");
  const [scheduledTime, setScheduledTime] = useState("");

  if (!isOpen) return null;

  const canCheckout = items.length > 0 && guestName.trim() && unitLabel.trim();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand-100">
          <h2 className="text-lg font-serif text-ocean-900">Your Cart</h2>
          <button onClick={onClose} className="p-1 text-sand-400 hover:text-ocean-900">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-sand-400 text-center py-10">Your cart is empty</p>
          ) : (
            items.map((entry) => {
              const item = getItemById(entry.itemId);
              if (!item) return null;
              return (
                <div key={entry.itemId} className="flex items-center gap-3 py-3 border-b border-sand-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ocean-900 truncate">{item.name}</p>
                    <p className="text-xs text-sand-400">{item.size}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(entry.itemId, entry.quantity - 1)}
                      className="w-7 h-7 rounded-full border border-sand-200 flex items-center justify-center text-sand-500 hover:bg-sand-50"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-5 text-center">{entry.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(entry.itemId, entry.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-sand-200 flex items-center justify-center text-sand-500 hover:bg-sand-50"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-ocean-900 w-16 text-right">
                    {formatPrice(item.priceInCents * entry.quantity)}
                  </p>
                  <button onClick={() => onRemoveItem(entry.itemId)} className="text-sand-300 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}

          {items.length > 0 && (
            <>
              {/* Delivery preference */}
              <div className="pt-3">
                <p className="text-xs font-semibold text-sand-500 uppercase mb-2">Delivery</p>
                <div className="space-y-2">
                  {DELIVERY_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        deliveryPref === opt.id ? "border-ocean-300 bg-ocean-50" : "border-sand-100 hover:bg-sand-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value={opt.id}
                        checked={deliveryPref === opt.id}
                        onChange={() => setDeliveryPref(opt.id)}
                        className="text-ocean-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-ocean-900">{opt.label}</p>
                        <p className="text-xs text-sand-400">{opt.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {deliveryPref === "scheduled" && (
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="mt-2 w-full border border-sand-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="Select time"
                  />
                )}
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-sand-400 leading-relaxed pt-2">
                {FL_ALCOHOL_DISCLAIMER}
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-sand-100 px-5 py-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-sand-500">Subtotal</span>
              <span className="text-ocean-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-sand-500">Service & Delivery Fee</span>
              <span className="text-ocean-900">{formatPrice(serviceFee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-sand-100 pt-2">
              <span className="text-ocean-900">Total</span>
              <span className="text-ocean-900">{formatPrice(total)}</span>
            </div>

            <div className="flex gap-2 pt-1">
              <div className="flex-1">
                <label className="text-[10px] text-sand-400 font-semibold block mb-0.5">Your Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => onGuestNameChange(e.target.value)}
                  placeholder="Guest name"
                  className="w-full border border-sand-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-ocean-400"
                />
              </div>
              <div className="w-20">
                <label className="text-[10px] text-sand-400 font-semibold block mb-0.5">Unit #</label>
                <input
                  type="text"
                  value={unitLabel}
                  onChange={(e) => onUnitLabelChange(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full border border-sand-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-ocean-400"
                />
              </div>
            </div>

            <button
              onClick={() => onCheckout(deliveryPref, scheduledTime)}
              disabled={!canCheckout || checking}
              className="w-full bg-ocean-500 text-white py-3 rounded-xl font-semibold hover:bg-ocean-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checking ? "Redirecting..." : `Checkout — ${formatPrice(total)}`}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
