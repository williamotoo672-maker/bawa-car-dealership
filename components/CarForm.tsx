"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import type { Car } from "@/lib/db";

type CarFormValues = {
  make: string;
  model: string;
  year: string;
  price: string;
  mileage: string;
  body_type: string;
  fuel_type: string;
  transmission: string;
  color: string;
  description: string;
  image_url: string;
  featured: boolean;
  status: string;
};

const BODY_TYPES = ["Sedan", "SUV", "Coupe", "Hatchback", "Convertible", "Pickup", "Van", "Wagon"];
const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"];
const TRANSMISSIONS = ["Automatic", "Manual"];

function toFormValues(car?: Car | null): CarFormValues {
  return {
    make: car?.make ?? "",
    model: car?.model ?? "",
    year: car ? String(car.year) : String(new Date().getFullYear()),
    price: car?.price ? String(Number(car.price)) : "",
    mileage: car?.mileage != null ? String(car.mileage) : "",
    body_type: car?.body_type ?? BODY_TYPES[0],
    fuel_type: car?.fuel_type ?? FUEL_TYPES[0],
    transmission: car?.transmission ?? TRANSMISSIONS[0],
    color: car?.color ?? "",
    description: car?.description ?? "",
    image_url: car?.image_url ?? "",
    featured: car?.featured ?? false,
    status: car?.status ?? "available",
  };
}

export default function CarForm({ car }: { car?: Car | null }) {
  const router = useRouter();
  const isEditing = Boolean(car);

  const [values, setValues] = useState<CarFormValues>(toFormValues(car));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(car?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof CarFormValues>(key: K, value: CarFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!values.make || !values.model || !values.year || !values.price) {
      setError("Make, model, year and price are required.");
      return;
    }

    let imageUrl = values.image_url;

    if (imageFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      setUploading(false);

      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => ({}));
        setError(data.error || "Image upload failed.");
        return;
      }
      const data = await uploadRes.json();
      imageUrl = data.url;
    }

    setSaving(true);
    const payload = {
      make: values.make,
      model: values.model,
      year: Number(values.year),
      price: Number(values.price),
      mileage: values.mileage ? Number(values.mileage) : null,
      body_type: values.body_type || null,
      fuel_type: values.fuel_type || null,
      transmission: values.transmission || null,
      color: values.color || null,
      description: values.description || null,
      image_url: imageUrl || null,
      featured: values.featured,
      status: values.status,
    };

    const res = await fetch(isEditing ? `/api/cars/${car!.id}` : "/api/cars", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not save this car.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  const busy = uploading || saving;

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {error && (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700" role="alert">
          {error}
        </p>
      )}

      <div>
        <label className="field-label">Photo</label>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative h-40 w-56 shrink-0 overflow-hidden border border-hairline bg-pearl">
            {imagePreview ? (
              <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full items-center justify-center text-[13px] text-steel">
                No image
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={onImageChange}
              className="block text-[14px] text-steel file:mr-4 file:border-0 file:bg-graphite file:px-4 file:py-2.5 file:text-[13px] file:tracking-wide2 file:uppercase file:text-paper hover:file:bg-brand"
            />
            <p className="mt-2 max-w-xs text-[13px] text-steel">
              JPEG, PNG, WEBP or AVIF, up to 8MB. Landscape photos look best.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="make">Make</label>
          <input id="make" className="field-input" value={values.make}
            onChange={(e) => update("make", e.target.value)} placeholder="Mercedes-Benz" required />
        </div>
        <div>
          <label className="field-label" htmlFor="model">Model</label>
          <input id="model" className="field-input" value={values.model}
            onChange={(e) => update("model", e.target.value)} placeholder="S-Class S580" required />
        </div>
        <div>
          <label className="field-label" htmlFor="year">Year</label>
          <input id="year" type="number" className="field-input" value={values.year}
            onChange={(e) => update("year", e.target.value)} required />
        </div>
        <div>
          <label className="field-label" htmlFor="price">Price (USD)</label>
          <input id="price" type="number" min="0" step="1" className="field-input" value={values.price}
            onChange={(e) => update("price", e.target.value)} placeholder="45000" required />
        </div>
        <div>
          <label className="field-label" htmlFor="mileage">Mileage</label>
          <input id="mileage" type="number" min="0" className="field-input" value={values.mileage}
            onChange={(e) => update("mileage", e.target.value)} placeholder="12000" />
        </div>
        <div>
          <label className="field-label" htmlFor="color">Color</label>
          <input id="color" className="field-input" value={values.color}
            onChange={(e) => update("color", e.target.value)} placeholder="Obsidian Black" />
        </div>
        <div>
          <label className="field-label" htmlFor="body_type">Body Type</label>
          <select id="body_type" className="field-input" value={values.body_type}
            onChange={(e) => update("body_type", e.target.value)}>
            {BODY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="fuel_type">Fuel Type</label>
          <select id="fuel_type" className="field-input" value={values.fuel_type}
            onChange={(e) => update("fuel_type", e.target.value)}>
            {FUEL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="transmission">Transmission</label>
          <select id="transmission" className="field-input" value={values.transmission}
            onChange={(e) => update("transmission", e.target.value)}>
            {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="status">Status</label>
          <select id="status" className="field-input" value={values.status}
            onChange={(e) => update("status", e.target.value)}>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="description">Description</label>
        <textarea id="description" rows={4} className="field-input" value={values.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="A short, honest description of this car's condition and standout features." />
      </div>

      <label className="flex items-center gap-3 text-[14px] text-graphite">
        <input type="checkbox" checked={values.featured}
          onChange={(e) => update("featured", e.target.checked)}
          className="h-4 w-4 border-hairline accent-brand" />
        Feature this car on the homepage
      </label>

      <div className="flex items-center gap-4 border-t border-hairline pt-8">
        <button type="submit" disabled={busy} className="btn-primary">
          {uploading ? "Uploading Photo…" : saving ? "Saving…" : isEditing ? "Save Changes" : "Add Car"}
        </button>
        <button type="button" onClick={() => router.push("/admin")} className="btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}
