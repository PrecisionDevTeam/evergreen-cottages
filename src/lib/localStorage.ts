import { useEffect, useState, useCallback } from "react";

const RECENT_KEY = "ec_recently_viewed";
const FAVORITES_KEY = "ec_favorites";
const MAX_RECENT = 6;

type RecentItem = {
  id: number;
  name: string;
  image: string;
  price: number;
  viewedAt: number;
};

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable
  }
}

// Recently viewed
export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    setItems(getStored<RecentItem[]>(RECENT_KEY, []));
  }, []);

  const addViewed = useCallback((property: { id: number; name: string; images: string[]; base_price: number | null }) => {
    const current = getStored<RecentItem[]>(RECENT_KEY, []);
    const filtered = current.filter((item) => item.id !== property.id);
    const updated = [
      {
        id: property.id,
        name: property.name,
        image: property.images[0] || "",
        price: property.base_price || 65,
        viewedAt: Date.now(),
      },
      ...filtered,
    ].slice(0, MAX_RECENT);
    setStored(RECENT_KEY, updated);
    setItems(updated);
  }, []);

  return { recentlyViewed: items, addViewed };
}

// Favorites
export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    setFavorites(getStored<number[]>(FAVORITES_KEY, []));
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    const current = getStored<number[]>(FAVORITES_KEY, []);
    const updated = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    setStored(FAVORITES_KEY, updated);
    setFavorites(updated);
  }, []);

  const isFavorite = useCallback((id: number) => {
    return favorites.includes(id);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
