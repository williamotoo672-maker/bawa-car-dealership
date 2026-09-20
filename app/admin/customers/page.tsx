import Link from "next/link";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customers — Bawa Cardealership" };

type Row = {
  id: number;
  name: string | null;
  email: string;
  provider: string;
  created_at: string;
  favorite_count: number;
  enquiry_count: number;
  test_drive_count: number;
};

async function getCustomers(): Promise<Row[]> {
  try {
    return (await sql`
      SELECT
        users.id, users.name, users.email, users.provider, users.created_at,
        COUNT(DISTINCT favorites.id)::int AS favorite_count,
        COUNT(DISTINCT enquiries.id)::int AS enquiry_count,
        COUNT(DISTINCT test_drives.id)::int AS test_drive_count
      FROM users
      LEFT JOIN favorites ON favorites.user_id = users.id
      LEFT JOIN enquiries ON enquiries.user_id = users.id
      LEFT JOIN test_drives ON test_drives.user_id = users.id
      GROUP BY users.id
      ORDER BY users.created_at DESC
    `) as Row[];
  } catch {
    return [];
  }
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="container-content py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] text-graphite">Customers</h1>
          <p className="mt-2 text-[14px] text-steel">
            {customers.length} registered customer{customers.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/admin" className="btn-outline">← Back to Dashboard</Link>
      </div>

      {customers.length === 0 ? (
        <p className="mt-10 card-soft p-10 text-center text-[15px] text-steel">
          No customers have signed up yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto card-soft">
          <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-b border-hairline bg-pearl text-[12px] tracking-wide2 uppercase text-steel">
                <th className="px-5 py-4 font-normal">Customer</th>
                <th className="px-5 py-4 font-normal">Signed Up</th>
                <th className="px-5 py-4 font-normal">Saved</th>
                <th className="px-5 py-4 font-normal">Enquiries</th>
                <th className="px-5 py-4 font-normal">Test Drives</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-hairline last:border-0">
                  <td className="px-5 py-4">
                    <div className="font-medium text-graphite">{c.name || "—"}</div>
                    <div className="text-[13px] text-steel">{c.email}</div>
                  </td>
                  <td className="px-5 py-4 text-graphite">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-graphite">{c.favorite_count}</td>
                  <td className="px-5 py-4 text-graphite">{c.enquiry_count}</td>
                  <td className="px-5 py-4 text-graphite">{c.test_drive_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
