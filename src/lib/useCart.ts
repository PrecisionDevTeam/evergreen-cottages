import { useState, useEffect, useCallback } from "react";
import { getItemById, SERVICE_FEE_CENTS } from "./shop-catalog";

type CartEntry = { itemId: string; quantity: number };

const STORAGE_KEY = "ec-shop-cart";

function loadCart(): CartEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage full or unavailable
  }
}

export function useCart() {
  const [items, setItems] = useState<CartEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveCart(items);
  }, [items, loaded]);

  const addItem = useCallback((itemId: string, qty = 1) => {
    const catalogItem = getItemById(itemId);
    if (!catalogItem) return;
    setItems((prev) => {
      const existing = prev.find((e) => e.itemId === itemId);
      if (existing) {
        return prev.map((e) =>
          e.itemId === itemId
            ? { ...e, quantity: Math.min(e.quantity + qty, catalogItem.maxQuantity) }
            : e
        );
      }
      return [...prev, { itemId, quantity: Math.min(qty, catalogItem.maxQuantity) }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((e) => e.itemId !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, qty: number) => {
    const catalogItem = getItemById(itemId);
    if (!catalogItem) return;
    if (qty <= 0) {
      setItems((prev) => prev.filter((e) => e.itemId !== itemId));
      return;
    }
    setItems((prev) =>
      prev.map((e) =>
        e.itemId === itemId
          ? { ...e, quantity: Math.min(qty, catalogItem.maxQuantity) }
          : e
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = items.reduce((sum, entry) => {
    const item = getItemById(entry.itemId);
    return sum + (item ? item.priceInCents * entry.quantity : 0);
  }, 0);

  const serviceFee = items.length > 0 ? SERVICE_FEE_CENTS : 0;
  const total = subtotal + serviceFee;
  const itemCount = items.reduce((sum, e) => sum + e.quantity, 0);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    serviceFee,
    total,
    itemCount,
    loaded,
  };
}
