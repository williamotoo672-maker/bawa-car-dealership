import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sql, type Car } from "@/lib/db";
import { formatMileage, formatPrice } from "@/lib/format";
import EnquiryCard from "@/components/EnquiryCard";

export const revalidate = 30;

async function getCar(id: string): Promise<Car | null> {
  try {
    const [car] = (await sql`SELECT * FROM cars WHERE id = ${id}`) as Car[];
    return car ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCar(id);
  if (!car) return { title: "Car not found — Bawa Cardealership" };
  return { title: `${car.year} ${car.make} ${car.model} — Bawa Cardealership` };
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getCar(id);
  if (!car) notFound();

  const specs = [
    { label: "Make", value: car.make },
    { label: "Model", value: car.model },
    { label: "Year", value: String(car.year) },
    { label: "Body Type", value: car.body_type ?? "—" },
    { label: "Mileage", value: formatMileage(car.mileage) },
    { label: "Fuel Type", value: car.fuel_type ?? "—" },
    { label: "Transmission", value: car.transmission ?? "—" },
    { label: "Color", value: car.color ?? "—" },
  ];

  const isSold = car.status === "sold";

  return (
    <div className="container-content py-12 md:py-16">
      <Link
        href="/inventory"
        className="text-[13px] font-semibold tracking-wide2 uppercase text-steel hover:text-brand"
      >
        ← Back to Collection
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-pearl">
            {car.image_url ? (
              <Image
                src={car.image_url}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                priority
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-steel">
                No image yet
              </div>
            )}
            {isSold && (
              <span className="absolute left-5 top-5 rounded-full bg-graphite px-3 py-1 text-[11px] tracking-wide2 uppercase text-paper">
                Sold
              </span>
            )}
          </div>

          <div className="mt-8">
            <h1 className="font-display text-[28px] leading-tight text-graphite">
              {car.year} {car.make} {car.model}
            </h1>
            <p className="mt-2 font-display text-[24px] text-brand">
              {formatPrice(car.price)}
            </p>
          </div>

          {car.description && (
            <div className="mt-8">
              <h2 className="font-display text-[20px] text-graphite">
                About this car
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink">
                {car.description}
              </p>
            </div>
          )}

          <div className="mt-8">
            <h2 className="font-display text-[20px] text-graphite">
              Specifications
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-hairline pt-4 sm:grid-cols-4">
              {specs.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-[12px] tracking-wide2 uppercase text-steel">
                    {spec.label}
                  </dt>
                  <dd className="mt-1 text-[15px] text-graphite">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <aside className="h-fit">
          {isSold ? (
            <div className="card-soft p-8 text-center">
              <p className="text-[15px] text-steel">
                This car has been sold. Browse similar listings in the
                collection, or get in touch and we'll help you find
                something just as good.
              </p>
              <Link href="/inventory" className="btn-outline mt-6 w-full">
                Browse the Collection
              </Link>
            </div>
          ) : (
            <EnquiryCard car={car} />
          )}
        </aside>
      </div>
    </div>
  );
}
