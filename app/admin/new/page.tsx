import CarForm from "@/components/CarForm";

export const metadata = { title: "Add a Car — Bawa Cardealership" };

export default function NewCarPage() {
  return (
    <div className="container-content max-w-3xl py-16">
      <h1 className="font-display text-[32px] text-graphite">Add a Car</h1>
      <p className="mt-2 text-[14px] text-steel">
        This will appear in the public collection immediately unless you set
        its status to reserved or sold.
      </p>
      <div className="mt-10">
        <CarForm />
      </div>
    </div>
  );
}
