import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { sql, type Car } from "@/lib/db";
import CarCard from "@/components/CarCard";
import CompareFavorites from "@/components/CompareFavorites";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Account — Bawa Cardealership" };

type EnquiryRow = { id: number; created_at: string; make: string | null; model: string | null; year: number | null; car_id: number | null };
type TestDriveRow = EnquiryRow & { preferred_date: string; preferred_time: string | null; status: string };
type FinancingRow = EnquiryRow & { status: string };

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?from=/account");
  }

  const userId = Number(session.user.id);

  const [favorites, enquiries, testDrives, financingApps] = await Promise.all([
    sql`
      SELECT cars.* FROM favorites
      JOIN cars ON cars.id = favorites.car_id
      WHERE favorites.user_id = ${userId}
      ORDER BY favorites.created_at DESC
    `,
    sql`
      SELECT enquiries.id, enquiries.created_at, enquiries.car_id, cars.make, cars.model, cars.year
      FROM enquiries LEFT JOIN cars ON cars.id = enquiries.car_id
      WHERE enquiries.user_id = ${userId}
      ORDER BY enquiries.created_at DESC
    `,
    sql`
      SELECT test_drives.id, test_drives.created_at, test_drives.car_id, test_drives.preferred_date,
             test_drives.preferred_time, test_drives.status, cars.make, cars.model, cars.year
      FROM test_drives LEFT JOIN cars ON cars.id = test_drives.car_id
      WHERE test_drives.user_id = ${userId}
      ORDER BY test_drives.created_at DESC
    `,
    sql`
      SELECT financing_applications.id, financing_applications.created_at, financing_applications.car_id,
             financing_applications.status, cars.make, cars.model, cars.year
      FROM financing_applications LEFT JOIN cars ON cars.id = financing_applications.car_id
      WHERE financing_applications.user_id = ${userId}
      ORDER BY financing_applications.created_at DESC
    `,
  ]).catch(() => [[], [], [], []]) as [Car[], EnquiryRow[], TestDriveRow[], FinancingRow[]];

  return (
    <div className="container-content max-w-4xl py-16">
      <h1 className="font-display text-[32px] text-graphite">My Account</h1>
      <p className="mt-2 text-[14px] text-steel">
        Signed in as {session.user.email}
      </p>

      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[22px] text-graphite">
            Saved Vehicles
          </h2>
          <Link href="/inventory" className="text-[13px] font-semibold text-brand hover:underline">
            Browse more →
          </Link>
        </div>

        {favorites.length === 0 ? (
          <p className="mt-4 text-[14px] text-steel">
            You haven't saved any vehicles yet. Tap the heart icon on a car
            to save it here.
          </p>
        ) : (
          <>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
            {favorites.length > 1 && <CompareFavorites cars={favorites} />}
          </>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-[22px] text-graphite">My Enquiries</h2>
        {enquiries.length === 0 ? (
          <p className="mt-4 text-[14px] text-steel">No enquiries sent yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-hairline">
            {enquiries.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3 text-[14px]">
                <span className="text-graphite">
                  {e.car_id && e.make ? `${e.year} ${e.make} ${e.model}` : "General enquiry"}
                </span>
                <span className="text-steel">{new Date(e.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-[22px] text-graphite">Test Drive Bookings</h2>
        {testDrives.length === 0 ? (
          <p className="mt-4 text-[14px] text-steel">No test drives booked yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-hairline">
            {testDrives.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-[14px]">
                <span className="text-graphite">
                  {t.make ? `${t.year} ${t.make} ${t.model}` : "Vehicle"} —{" "}
                  {new Date(t.preferred_date).toLocaleDateString()}
                  {t.preferred_time ? ` · ${t.preferred_time}` : ""}
                </span>
                <StatusBadge status={t.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-[22px] text-graphite">Financing Applications</h2>
        {financingApps.length === 0 ? (
          <p className="mt-4 text-[14px] text-steel">
            No financing applications yet.{" "}
            <Link href="/financing" className="text-brand hover:underline">
              Start one →
            </Link>
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-hairline">
            {financingApps.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-[14px]">
                <span className="text-graphite">
                  {f.car_id && f.make ? `${f.year} ${f.make} ${f.model}` : "General application"}
                </span>
                <StatusBadge status={f.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-pearl px-3 py-1 text-[12px] capitalize text-steel">
      {status}
    </span>
  );
}
