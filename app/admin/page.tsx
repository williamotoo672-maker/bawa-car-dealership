import Link from "next/link";
import { sql, type Car } from "@/lib/db";
import AdminCarTable from "@/components/AdminCarTable";
import SignOutButton from "@/components/SignOutButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dealer Panel — Bawa Cardealership" };

async function getCars(): Promise<Car[]> {
  try {
    return (await sql`SELECT * FROM cars ORDER BY created_at DESC`) as Car[];
  } catch {
    return [];
  }
}

export default async function AdminDashboardPage() {
  const cars = await getCars();

  return (
    <div className="container-content py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] text-graphite">
            Dealer Panel
          </h1>
          <p className="mt-2 text-[14px] text-steel">
            {cars.length} car{cars.length === 1 ? "" : "s"} in the collection
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Link href="/admin/enquiries" className="text-[13px] font-semibold tracking-wide2 uppercase text-graphite hover:text-brand">
            Enquiries
          </Link>
          <Link href="/admin/bookings" className="text-[13px] font-semibold tracking-wide2 uppercase text-graphite hover:text-brand">
            Bookings
          </Link>
          <Link href="/admin/financing" className="text-[13px] font-semibold tracking-wide2 uppercase text-graphite hover:text-brand">
            Financing
          </Link>
          <Link href="/admin/customers" className="text-[13px] font-semibold tracking-wide2 uppercase text-graphite hover:text-brand">
            Customers
          </Link>
          <Link href="/admin/new" className="btn-primary">
            Add a Car
          </Link>
          <SignOutButton />
        </div>
      </div>

      <AdminCarTable cars={cars} />
    </div>
  );
}
