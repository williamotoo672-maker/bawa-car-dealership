"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Car } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export default function AdminCarTable({ cars }: { cars: Car[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(car: Car) {
    const confirmed = window.confirm(
      `Delete ${car.year} ${car.make} ${car.model}? This can't be undone.`
    );
    if (!confirmed) return;

    setDeletingId(car.id);
    const res = await fetch(`/api/cars/${car.id}`, { method: "DELETE" });
    setDeletingId(null);

    if (res.ok) {
      router.refresh();
    } else {
      window.alert("Could not delete this car. Please try again.");
    }
  }

  if (cars.length === 0) {
    return (
      <p className="mt-10 border border-hairline p-10 text-center text-[15px] text-steel">
        No cars yet. Click "Add a Car" to create your first listing.
      </p>
    );
  }

  return (
    <div className="mt-8 overflow-x-auto border border-hairline">
      <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">
        <thead>
          <tr className="border-b border-hairline bg-pearl text-[12px] tracking-wide2 uppercase text-steel">
            <th className="px-5 py-4 font-normal">Car</th>
            <th className="px-5 py-4 font-normal">Price</th>
            <th className="px-5 py-4 font-normal">Status</th>
            <th className="px-5 py-4 font-normal">Featured</th>
            <th className="px-5 py-4 font-normal text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((car) => (
            <tr key={car.id} className="border-b border-hairline last:border-0">
              <td className="px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden bg-pearl">
                    {car.image_url && (
                      <Image src={car.image_url} alt="" fill className="object-cover" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-graphite">
                      {car.year} {car.make} {car.model}
                    </div>
                    <div className="text-[13px] text-steel">
                      {car.body_type || "—"}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-graphite">{formatPrice(car.price)}</td>
              <td className="px-5 py-4 capitalize text-graphite">{car.status}</td>
              <td className="px-5 py-4 text-graphite">{car.featured ? "Yes" : "—"}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-4 text-[13px] tracking-wide2 uppercase">
                  <Link href={`/admin/edit/${car.id}`} className="text-graphite hover:text-brand">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(car)}
                    disabled={deletingId === car.id}
                    className="text-red-700 hover:text-red-900 disabled:opacity-50"
                  >
                    {deletingId === car.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
