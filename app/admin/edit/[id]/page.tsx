import { notFound } from "next/navigation";
import { sql, type Car } from "@/lib/db";
import CarForm from "@/components/CarForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit Car — Bawa Cardealership" };

async function getCar(id: string): Promise<Car | null> {
  try {
    const [car] = (await sql`SELECT * FROM cars WHERE id = ${id}`) as Car[];
    return car ?? null;
  } catch {
    return null;
  }
}

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getCar(id);
  if (!car) notFound();

  return (
    <div className="container-content max-w-3xl py-16">
      <h1 className="font-display text-[32px] text-graphite">
        Edit {car.year} {car.make} {car.model}
      </h1>
      <p className="mt-2 text-[14px] text-steel">
        Update details or upload a new photo. Changes go live immediately.
      </p>
      <div className="mt-10">
        <CarForm car={car} />
      </div>
    </div>
  );
}
