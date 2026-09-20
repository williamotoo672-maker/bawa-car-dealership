"use client";

import { useState } from "react";
import type { Car } from "@/lib/db";
import { formatMileage, formatPrice } from "@/lib/format";

export default function CompareFavorites({ cars }: { cars: Car[] }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [comparing, setComparing] = useState(false);

  function toggle(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  }

  const selectedCars = cars.filter((c) => selectedIds.includes(c.id));

  return (
    <div className="mt-6">
      {!comparing ? (
        <div className="card-soft p-5">
          <p className="text-[13px] font-semibold text-graphite">
            Compare up to 3 saved cars
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {cars.map((car) => (
              <label
                key={car.id}
                className="flex items-center gap-2 rounded-full border border-hairline px-3 py-1.5 text-[13px] text-graphite"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(car.id)}
                  onChange={() => toggle(car.id)}
                  className="h-3.5 w-3.5 accent-brand"
                />
                {car.year} {car.make} {car.model}
              </label>
            ))}
          </div>
          <button
            onClick={() => setComparing(true)}
            disabled={selectedIds.length < 2}
            className="btn-brand mt-4 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Compare Selected ({selectedIds.length})
          </button>
        </div>
      ) : (
        <div className="card-soft overflow-x-auto p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-graphite">Comparing {selectedCars.length} cars</p>
            <button onClick={() => setComparing(false)} className="text-[13px] text-brand hover:underline">
              ← Back
            </button>
          </div>
          <table className="w-full min-w-[480px] border-collapse text-left text-[14px]">
            <tbody>
              <Row label="Vehicle" values={selectedCars.map((c) => `${c.year} ${c.make} ${c.model}`)} bold />
              <Row label="Price" values={selectedCars.map((c) => formatPrice(c.price))} />
              <Row label="Mileage" values={selectedCars.map((c) => formatMileage(c.mileage))} />
              <Row label="Body Type" values={selectedCars.map((c) => c.body_type || "—")} />
              <Row label="Fuel Type" values={selectedCars.map((c) => c.fuel_type || "—")} />
              <Row label="Transmission" values={selectedCars.map((c) => c.transmission || "—")} />
              <Row label="Color" values={selectedCars.map((c) => c.color || "—")} />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ label, values, bold }: { label: string; values: string[]; bold?: boolean }) {
  return (
    <tr className="border-b border-hairline last:border-0">
      <td className="py-3 pr-4 text-[12px] uppercase tracking-wide2 text-steel">{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`py-3 pr-4 ${bold ? "font-semibold text-graphite" : "text-ink"}`}>
          {v}
        </td>
      ))}
    </tr>
  );
}
