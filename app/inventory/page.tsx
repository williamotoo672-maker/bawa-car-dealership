import { sql, type Car } from "@/lib/db";
import InventoryGrid from "@/components/InventoryGrid";

export const revalidate = 30;
export const metadata = { title: "Inventory — Bawa Cardealership" };

async function getCars(): Promise<Car[]> {
  try {
    return (await sql`
      SELECT * FROM cars ORDER BY featured DESC, created_at DESC
    `) as Car[];
  } catch {
    return [];
  }
}

export default async function InventoryPage() {
  const cars = await getCars();

  return (
    <div className="container-content py-16 md:py-20">
      <h1 className="font-display text-[36px] text-graphite md:text-[42px]">
        The Collection
      </h1>
      <p className="mt-3 max-w-xl text-[15px] text-steel">
        Every car below is on our lot and ready to view. Inventory changes
        weekly — if something catches your eye, don't wait too long on it.
      </p>

      <div className="mt-10">
        <InventoryGrid cars={cars} />
      </div>
    </div>
  );
}
