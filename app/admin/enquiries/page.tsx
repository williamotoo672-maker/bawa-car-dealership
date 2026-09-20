import Link from "next/link";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Enquiries — Bawa Cardealership" };

type EnquiryRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  preferred_contact: string | null;
  message: string | null;
  created_at: string;
  make: string | null;
  model: string | null;
  year: number | null;
  car_id: number | null;
};

async function getEnquiries(): Promise<EnquiryRow[]> {
  try {
    return (await sql`
      SELECT enquiries.*, cars.make, cars.model, cars.year
      FROM enquiries
      LEFT JOIN cars ON cars.id = enquiries.car_id
      ORDER BY enquiries.created_at DESC
    `) as EnquiryRow[];
  } catch {
    return [];
  }
}

export default async function AdminEnquiriesPage() {
  const enquiries = await getEnquiries();

  return (
    <div className="container-content py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] text-graphite">Enquiries</h1>
          <p className="mt-2 text-[14px] text-steel">
            {enquiries.length} enquir{enquiries.length === 1 ? "y" : "ies"} received
          </p>
        </div>
        <Link href="/admin" className="btn-outline">
          ← Back to Dashboard
        </Link>
      </div>

      {enquiries.length === 0 ? (
        <p className="mt-10 card-soft p-10 text-center text-[15px] text-steel">
          No enquiries yet. They'll show up here as soon as a customer
          submits the "Request More Details" form.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {enquiries.map((e) => (
            <div key={e.id} className="card-soft p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-graphite">{e.name}</p>
                  <p className="text-[14px] text-steel">{e.email}{e.phone ? ` · ${e.phone}` : ""}</p>
                </div>
                <p className="text-[12px] tracking-wide2 uppercase text-steel">
                  {new Date(e.created_at).toLocaleString()}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
                {e.car_id && e.make && (
                  <Link
                    href={`/cars/${e.car_id}`}
                    className="rounded-full bg-brand-light px-3 py-1 font-semibold text-brand hover:underline"
                  >
                    {e.year} {e.make} {e.model}
                  </Link>
                )}
                {e.preferred_contact && (
                  <span className="rounded-full bg-pearl px-3 py-1 text-steel">
                    Prefers {e.preferred_contact}
                  </span>
                )}
              </div>

              {e.message && (
                <p className="mt-3 text-[14px] leading-relaxed text-ink">
                  {e.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
