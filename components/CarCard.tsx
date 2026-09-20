import Image from "next/image";
import Link from "next/link";
import type { Car } from "@/lib/db";
import { formatMileage, formatPrice } from "@/lib/format";
import FavoriteButton from "./FavoriteButton";

export default function CarCard({ car }: { car: Car }) {
  const isSold = car.status === "sold";

  return (
    <Link
      href={`/cars/${car.id}`}
      className="card-soft group block overflow-hidden hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-pearl">
        {car.image_url ? (
          <Image
            src={car.image_url}
            alt={`${car.year} ${car.make} ${car.model}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-steel">
            No image yet
          </div>
        )}
        {isSold && (
          <span className="absolute left-4 top-4 rounded-full bg-graphite px-3 py-1 text-[11px] tracking-wide2 uppercase text-paper">
            Sold
          </span>
        )}
        {car.featured && !isSold && (
          <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 text-[11px] tracking-wide2 uppercase text-paper">
            Featured
          </span>
        )}
        <div className="absolute right-3 top-3">
          <FavoriteButton carId={car.id} />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-[19px] leading-tight text-graphite">
            {car.year} {car.make} {car.model}
          </h3>
        </div>
        <p className="mt-1 text-[13px] tracking-wide2 uppercase text-steel">
          {[car.body_type, car.transmission, formatMileage(car.mileage)]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="mt-4 font-display text-[18px] text-brand">
          {formatPrice(car.price)}
        </p>
      </div>
    </Link>
  );
}
