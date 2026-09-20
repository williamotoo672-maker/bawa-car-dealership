import Link from "next/link";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Financing Applications — Bawa Cardealership" };

type Row = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  employment_status: string | null;
  monthly_income: string | null;
  down_payment: string | null;
  message: string | null;
  status: string;
  created_at: string;
  car_id: number | null;
  make: string | null;
  model: string | null;
  year: number | null;
};

async function getApplications(): Promise<Row[]> {
  try {
    return (await sql`
      SELECT financing_applications.*, cars.make, cars.model, cars.year
      FROM financing_applications LEFT JOIN cars ON cars.id = financing_applications.car_id
      ORDER BY financing_applications.created_at DESC
    `) as Row[];
  } catch {
    return [];
  }
}

export default async function AdminFinancingPage() {
  const applications = await getApplications();

  return (
    <div className="container-content py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] text-graphite">Financing Applications</h1>
          <p className="mt-2 text-[14px] text-steel">
            {applications.length} application{applications.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/admin" className="btn-outline">← Back to Dashboard</Link>
      </div>

      {applications.length === 0 ? (
        <p className="mt-10 card-soft p-10 text-center text-[15px] text-steel">
          No financing applications yet.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {applications.map((a) => (
            <div key={a.id} className="card-soft p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-graphite">{a.name}</p>
                  <p className="text-[14px] text-steel">{a.email}{a.phone ? ` · ${a.phone}` : ""}</p>
                </div>
                <span className="rounded-full bg-pearl px-3 py-1 text-[12px] capitalize text-steel">
                  {a.status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
                {a.car_id && a.make && (
                  <Link
                    href={`/cars/${a.car_id}`}
                    className="rounded-full bg-brand-light px-3 py-1 font-semibold text-brand hover:underline"
                  >
                    {a.year} {a.make} {a.model}
                  </Link>
                )}
                {a.employment_status && (
                  <span className="rounded-full bg-pearl px-3 py-1 text-steel">{a.employment_status}</span>
                )}
                {a.monthly_income && (
                  <span className="rounded-full bg-pearl px-3 py-1 text-steel">
                    Income: GHS {Number(a.monthly_income).toLocaleString()}/mo
                  </span>
                )}
                {a.down_payment && (
                  <span className="rounded-full bg-pearl px-3 py-1 text-steel">
                    Down payment: GHS {Number(a.down_payment).toLocaleString()}
                  </span>
                )}
              </div>

              {a.message && (
                <p className="mt-3 text-[14px] leading-relaxed text-ink">{a.message}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
