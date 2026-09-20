"use client";

import { useMemo, useState } from "react";
import type { Car } from "@/lib/db";
import CarCard from "./CarCard";

export default function InventoryGrid({ cars }: { cars: Car[] }) {
  const [query, setQuery] = useState("");
  const [make, setMake] = useState("all");
  const [bodyType, setBodyType] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYear, setMinYear] = useState("");
  const [sort, setSort] = useState("newest");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const makes = useMemo(() => {
    const set = new Set(cars.map((c) => c.make).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [cars]);

  const bodyTypes = useMemo(() => {
    const set = new Set(cars.map((c) => c.body_type).filter(Boolean) as string[]);
    return ["all", ...Array.from(set).sort()];
  }, [cars]);

  const filtered = useMemo(() => {
    let result = cars.filter((car) => {
      const matchesQuery = `${car.year} ${car.make} ${car.model}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesMake = make === "all" || car.make === make;
      const matchesBody = bodyType === "all" || car.body_type === bodyType;
      const matchesPrice = !maxPrice || Number(car.price) <= Number(maxPrice);
      const matchesYear = !minYear || car.year >= Number(minYear);
      return matchesQuery && matchesMake && matchesBody && matchesPrice && matchesYear;
    });

    if (sort === "price-asc") {
      result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price-desc") {
      result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === "year-desc") {
      result = [...result].sort((a, b) => b.year - a.year);
    } else if (sort === "mileage-asc") {
      result = [...result].sort((a, b) => (a.mileage ?? 0) - (b.mileage ?? 0));
    }

    return result;
  }, [cars, query, make, bodyType, maxPrice, minYear, sort]);

  return (
    <div>
      <div className="space-y-4 border-b border-hairline pb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search make or model…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="field-input md:max-w-xs"
          />
          <div className="flex flex-wrap gap-3">
            <select value={make} onChange={(e) => setMake(e.target.value)} className="field-input md:w-40">
              {makes.map((m) => (
                <option key={m} value={m}>{m === "all" ? "All makes" : m}</option>
              ))}
            </select>
            <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} className="field-input md:w-44">
              {bodyTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All body types" : type}
                </option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="field-input md:w-48">
              <option value="newest">Newest listed</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="year-desc">Model year</option>
              <option value="mileage-asc">Mileage: low to high</option>
            </select>
            <button
              type="button"
              onClick={() => setShowMoreFilters((v) => !v)}
              className="rounded-lg border border-hairline px-4 py-3 text-[13px] font-semibold text-graphite hover:border-brand hover:text-brand"
            >
              {showMoreFilters ? "Fewer filters" : "More filters"}
            </button>
          </div>
        </div>

        {showMoreFilters && (
          <div className="flex flex-wrap gap-4 rounded-lg bg-pearl p-4">
            <div className="flex-1 min-w-[180px]">
              <label className="field-label">Max Price (USD)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 60000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="field-input"
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="field-label">Earliest Model Year</label>
              <input
                type="number"
                min="1990"
                placeholder="e.g. 2020"
                value={minYear}
                onChange={(e) => setMinYear(e.target.value)}
                className="field-input"
              />
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-14 text-center text-[15px] text-steel">
          No cars match your search right now.
        </p>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}
