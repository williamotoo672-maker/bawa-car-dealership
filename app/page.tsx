import Link from "next/link";
import { sql, type Car } from "@/lib/db";
import Hero from "@/components/Hero";
import CarCard from "@/components/CarCard";

export const revalidate = 60;

async function getFeaturedCars(): Promise<Car[]> {
  try {
    return (await sql`
      SELECT * FROM cars
      WHERE status = 'available'
      ORDER BY featured DESC, created_at DESC
      LIMIT 6
    `) as Car[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const cars = await getFeaturedCars();

  return (
    <>
      <Hero />

      <section className="container-content py-20 md:py-28">
        <div className="flex flex-col gap-4 border-b border-hairline pb-8 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display text-[32px] text-graphite md:text-[38px]">
            Currently in the collection
          </h2>
          <Link
            href="/inventory"
            className="text-[13px] tracking-wide2 uppercase text-graphite hover:text-brand"
          >
            View all inventory →
          </Link>
        </div>

        {cars.length === 0 ? (
          <p className="mt-10 max-w-md text-[15px] text-steel">
            No cars are listed yet. Sign in to the dealer panel to add the
            first one to the collection.
          </p>
        ) : (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>

      <section id="why-bawa" className="border-y border-hairline bg-pearl">
        <div className="container-content grid gap-12 py-20 md:grid-cols-3 md:py-28">
          <div>
            <h3 className="font-display text-[22px] text-graphite">
              Every car, inspected twice
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-steel">
              Before a listing goes live, it passes a 120-point mechanical
              and cosmetic check. What you see on the page is what arrives
              in the driveway.
            </p>
          </div>
          <div>
            <h3 className="font-display text-[22px] text-graphite">
              Transparent pricing, always
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-steel">
              No hidden fees, no last-minute markups. The price you see is
              the price you pay, with financing options laid out plainly.
            </p>
          </div>
          <div>
            <h3 className="font-display text-[22px] text-graphite">
              A team that answers
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-steel">
              Reach a real person by phone, WhatsApp, or in the showroom —
              before, during, and long after your purchase.
            </p>
          </div>
        </div>
      </section>

      <section className="container-content py-20 text-center md:py-28">
        <h2 className="mx-auto max-w-xl font-display text-[32px] leading-tight text-graphite md:text-[38px]">
          Ready to find your next car?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] text-steel">
          Browse what's currently available, or tell us what you're looking
          for and we'll help you find it.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link href="/inventory" className="btn-primary">
            Browse the Collection
          </Link>
          <a href="mailto:hello@bawacardealership.com" className="btn-outline">
            Email the Team
          </a>
        </div>
      </section>
    </>
  );
}
