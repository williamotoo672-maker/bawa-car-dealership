import { Suspense } from "react";
import { sql, type Car } from "@/lib/db";
import FinancingForm from "@/components/FinancingForm";

export const revalidate = 60;
export const metadata = { title: "Financing — Bawa Cardealership" };

async function getCars(): Promise<Car[]> {
  try {
    return (await sql`
      SELECT * FROM cars WHERE status = 'available' ORDER BY created_at DESC
    `) as Car[];
  } catch {
    return [];
  }
}

export default async function FinancingPage() {
  const cars = await getCars();

  return (
    <div className="container-content max-w-3xl py-16">
      <h1 className="font-display text-[36px] text-graphite">Financing</h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-steel">
        We work with local banks and finance partners to help you spread
        the cost of your next car. Here's how it generally works, and a
        form to get the conversation started.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <InfoCard
          title="Flexible terms"
          body="Repayment plans from 12 to 60 months, tailored to what you can comfortably afford."
        />
        <InfoCard
          title="Down payment from 20%"
          body="A lower upfront payment than most dealers ask for, on qualifying vehicles."
        />
        <InfoCard
          title="Fast turnaround"
          body="Most applications get an initial response from our finance partners within 1–2 business days."
        />
      </div>

      <div className="mt-12">
        <h2 className="font-display text-[22px] text-graphite">
          Start Your Application
        </h2>
        <p className="mt-2 text-[14px] text-steel">
          Fill in as much as you're comfortable with — you can always add
          details later. If you're signed in, we'll keep this tied to your
          account so you can track its status.
        </p>
        <div className="mt-6">
          <Suspense fallback={null}>
            <FinancingForm cars={cars} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="card-soft p-6">
      <h3 className="font-semibold text-graphite">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-steel">{body}</p>
    </div>
  );
}
