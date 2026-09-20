"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

type FavoritesContextValue = {
  favoriteIds: Set<number>;
  isLoading: boolean;
  toggleFavorite: (carId: number) => Promise<"favorited" | "unfavorited" | "unauthenticated">;
};

const FavoritesContext = createContext<FavoritesContextValue>({
  favoriteIds: new Set(),
  isLoading: false,
  toggleFavorite: async () => "unauthenticated",
});

export function useFavorites() {
  return useContext(FavoritesContext);
}

export default function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setFavoriteIds(new Set());
      return;
    }
    setIsLoading(true);
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((data) => setFavoriteIds(new Set(data.carIds || [])))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [status]);

  const toggleFavorite = useCallback(
    async (carId: number) => {
      if (status !== "authenticated") return "unauthenticated" as const;

      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ car_id: carId }),
      });

      if (!res.ok) return "unauthenticated" as const;

      const data = await res.json();
      const favorited: boolean = data.favorited;
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (favorited) next.add(carId);
        else next.delete(carId);
        return next;
      });
      return favorited ? "favorited" : "unfavorited";
    },
    [status]
  );

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isLoading, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}
