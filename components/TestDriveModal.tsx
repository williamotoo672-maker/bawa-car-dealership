"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type { Car } from "@/lib/db";
import Honeypot from "./Honeypot";

export default function TestDriveModal({ car, onClose }: { car: Car; onClose: () => void }) {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const carLabel = `${car.year} ${car.make} ${car.model}`;
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/test-drives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        car_id: car.id,
        name,
        email,
        phone,
        preferred_date: date,
        preferred_time: time,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/60 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-paper p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="font-display text-[22px] text-graphite">
            {sent ? "Test drive requested" : "Book a Test Drive"}
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-steel hover:text-brand">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 4l12 12M16 4L4 16" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="mt-4">
            <p className="text-[15px] leading-relaxed text-steel">
              Thanks, {name.split(" ")[0] || "there"}. We'll confirm your test
              drive of the {carLabel} for your requested time shortly.
            </p>
            <button onClick={onClose} className="btn-outline mt-6 w-full">
              Close
            </button>
          </div>
        ) : (
          <>
            <p className="mt-2 text-[14px] text-steel">
              Pick a date and time that works for you — we'll confirm by
              phone or email.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <Honeypot value={website} onChange={setWebsite} />
              <div>
                <label className="field-label">Vehicle</label>
                <input value={carLabel} readOnly className="field-input bg-pearl text-steel" />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="td-name">Full Name</label>
                  <input id="td-name" required value={name}
                    onChange={(e) => setName(e.target.value)} className="field-input" />
                </div>
                <div>
                  <label className="field-label" htmlFor="td-email">Email Address</label>
                  <input id="td-email" type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)} className="field-input" />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="td-phone">Phone Number</label>
                  <input id="td-phone" required value={phone}
                    onChange={(e) => setPhone(e.target.value)} className="field-input" />
                </div>
                <div>
                  <label className="field-label" htmlFor="td-date">Preferred Date</label>
                  <input id="td-date" type="date" required min={today} value={date}
                    onChange={(e) => setDate(e.target.value)} className="field-input" />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="td-time">Preferred Time</label>
                <select id="td-time" required value={time}
                  onChange={(e) => setTime(e.target.value)} className="field-input">
                  <option value="">Select a time</option>
                  <option value="Morning (9am–12pm)">Morning (9am–12pm)</option>
                  <option value="Afternoon (12pm–4pm)">Afternoon (12pm–4pm)</option>
                  <option value="Evening (4pm–6pm)">Evening (4pm–6pm)</option>
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="td-message">Message (Optional)</label>
                <textarea id="td-message" rows={3} value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Anything else we should know?" className="field-input" />
              </div>

              {error && (
                <p className="text-[13px] text-brand" role="alert">{error}</p>
              )}

              <button type="submit" disabled={submitting} className="btn-brand w-full">
                {submitting ? "Booking…" : "Confirm Test Drive"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
