"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Car } from "@/lib/db";
import Honeypot from "./Honeypot";

export default function FinancingForm({ cars }: { cars: Car[] }) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const preselectedCarId = searchParams.get("car") || "";

  const [carId, setCarId] = useState(preselectedCarId);
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [phone, setPhone] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/financing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        car_id: carId ? Number(carId) : null,
        name,
        email,
        phone,
        employment_status: employmentStatus,
        monthly_income: monthlyIncome ? Number(monthlyIncome) : null,
        down_payment: downPayment ? Number(downPayment) : null,
        message,
        website,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="card-soft p-8 text-center">
        <h3 className="font-display text-[22px] text-graphite">
          Application received
        </h3>
        <p className="mt-3 text-[15px] text-steel">
          Thanks, {name.split(" ")[0] || "there"}. Our finance team will
          review your details and get back to you within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-soft space-y-5 p-8">
      <Honeypot value={website} onChange={setWebsite} />
      <div>
        <label className="field-label">Vehicle of Interest (Optional)</label>
        <select value={carId} onChange={(e) => setCarId(e.target.value)} className="field-input">
          <option value="">Not sure yet / general enquiry</option>
          {cars.map((car) => (
            <option key={car.id} value={car.id}>
              {car.year} {car.make} {car.model}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="fin-name">Full Name</label>
          <input id="fin-name" required value={name}
            onChange={(e) => setName(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="fin-email">Email Address</label>
          <input id="fin-email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} className="field-input" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="fin-phone">Phone Number</label>
          <input id="fin-phone" required value={phone}
            onChange={(e) => setPhone(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="fin-employment">Employment Status</label>
          <select id="fin-employment" value={employmentStatus}
            onChange={(e) => setEmploymentStatus(e.target.value)} className="field-input">
            <option value="">Select one</option>
            <option value="Employed">Employed</option>
            <option value="Self-employed">Self-employed</option>
            <option value="Business owner">Business owner</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="fin-income">Monthly Income (GHS, optional)</label>
          <input id="fin-income" type="number" min="0" value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="fin-down">Planned Down Payment (GHS, optional)</label>
          <input id="fin-down" type="number" min="0" value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)} className="field-input" />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="fin-message">Anything else we should know?</label>
        <textarea id="fin-message" rows={3} value={message}
          onChange={(e) => setMessage(e.target.value)} className="field-input" />
      </div>

      {error && (
        <p className="text-[13px] text-brand" role="alert">{error}</p>
      )}

      <button type="submit" disabled={submitting} className="btn-brand w-full">
        {submitting ? "Submitting…" : "Start My Application"}
      </button>
      <p className="text-center text-[12px] text-steel">
        This isn't a credit application or a guarantee of financing — it
        just starts the conversation. Our finance team will follow up with
        next steps.
      </p>
    </form>
  );
}
