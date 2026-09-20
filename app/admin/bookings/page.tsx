import Link from "next/link";
import { sql } from "@/lib/db";
import BookingStatusSelect from "@/components/BookingStatusSelect";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookings — Bawa Cardealership" };

type Row = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  preferred_date: string;
  preferred_time: string | null;
  message: string | null;
  status: string;
  created_at: string;
  car_id: number | null;
  make: string | null;
  model: string | null;
  year: number | null;
};

async function getBookings(): Promise<Row[]> {
  try {
    return (await sql`
      SELECT test_drives.*, cars.make, cars.model, cars.year
      FROM test_drives LEFT JOIN cars ON cars.id = test_drives.car_id
      ORDER BY test_drives.preferred_date ASC, test_drives.created_at DESC
    `) as Row[];
  } catch {
    return [];
  }
}

export default async function AdminBookingsPage() {
  const bookings = await getBookings();

  return (
    <div className="container-content py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] text-graphite">Test Drive Bookings</h1>
          <p className="mt-2 text-[14px] text-steel">
            {bookings.length} booking{bookings.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/admin" className="btn-outline">← Back to Dashboard</Link>
      </div>

      {bookings.length === 0 ? (
        <p className="mt-10 card-soft p-10 text-center text-[15px] text-steel">
          No test drives booked yet.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="card-soft p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-graphite">{b.name}</p>
                  <p className="text-[14px] text-steel">{b.email}{b.phone ? ` · ${b.phone}` : ""}</p>
                </div>
                <BookingStatusSelect id={b.id} status={b.status} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
                {b.car_id && b.make && (
                  <Link
                    href={`/cars/${b.car_id}`}
                    className="rounded-full bg-brand-light px-3 py-1 font-semibold text-brand hover:underline"
                  >
                    {b.year} {b.make} {b.model}
                  </Link>
                )}
                <span className="rounded-full bg-pearl px-3 py-1 text-steel">
                  {new Date(b.preferred_date).toLocaleDateString()}
                  {b.preferred_time ? ` · ${b.preferred_time}` : ""}
                </span>
              </div>

              {b.message && (
                <p className="mt-3 text-[14px] leading-relaxed text-ink">{b.message}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
