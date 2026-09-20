"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useFavorites } from "./FavoritesProvider";

export default function FavoriteButton({
  carId,
  variant = "icon",
}: {
  carId: number;
  variant?: "icon" | "full";
}) {
  const router = useRouter();
  const { status } = useSession();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const isFavorited = favoriteIds.has(carId);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (status !== "authenticated") {
      router.push(`/login?from=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    await toggleFavorite(carId);
  }

  if (variant === "full") {
    return (
      <button
        onClick={handleClick}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-hairline px-5 py-3 text-[13px] font-semibold tracking-wide2 uppercase text-graphite transition-colors hover:border-brand hover:text-brand"
      >
        <HeartIcon filled={isFavorited} />
        {isFavorited ? "Saved" : "Save Vehicle"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 shadow-sm transition-transform hover:scale-105"
    >
      <HeartIcon filled={isFavorited} />
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "#D92B2B" : "none"}
      stroke={filled ? "#D92B2B" : "#3A3B40"}
      strokeWidth="1.8"
    >
      <path
        d="M12 21s-7.5-4.6-10-9.1C0.3 8.4 2 4.5 5.8 4c2.2-.3 4.1.8 6.2 3 2.1-2.2 4-3.3 6.2-3 3.8.5 5.5 4.4 3.8 7.9C19.5 16.4 12 21 12 21z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
