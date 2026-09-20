"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { Car } from "@/lib/db";
import TestDriveModal from "./TestDriveModal";
import FavoriteButton from "./FavoriteButton";
import Honeypot from "./Honeypot";

export default function EnquiryCard({ car }: { car: Car }) {
  const [open, setOpen] = useState(false);
  const [testDriveOpen, setTestDriveOpen] = useState(false);

  return (
    <>
      <div className="card-soft p-8 text-center">
        <div className="flex justify-end">
          <FavoriteButton carId={car.id} variant="full" />
        </div>

        <div className="mx-auto -mt-2 flex h-16 w-16 items-center justify-center rounded-full bg-brand-light">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D92B2B" strokeWidth="1.8">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <p className="mt-5 text-[13px] font-bold tracking-wide2 uppercase text-brand">
          Interested in this vehicle?
        </p>
        <h3 className="mt-2 font-display text-[22px] leading-tight text-graphite">
          Get all the details you need.
        </h3>
        <p className="mt-3 text-[14px] leading-relaxed text-steel">
          Our team is here to help you with specs, pricing and everything
          you need to know.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Feature label="Personalised" sub="Assistance" />
          <Feature label="Quick" sub="Response" />
          <Feature label="Trusted" sub="Support" />
        </div>

        <button onClick={() => setOpen(true)} className="btn-brand mt-7 w-full">
          Request More Details →
        </button>
        <button
          onClick={() => setTestDriveOpen(true)}
          className="btn-outline mt-3 w-full"
        >
          Book a Test Drive
        </button>

        <div className="my-6 flex items-center gap-3 text-[12px] tracking-wide2 uppercase text-steel">
          <span className="h-px flex-1 bg-hairline" />
          or call us
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <a href="tel:+233302713429" className="block text-[15px] font-semibold text-graphite hover:text-brand">
          +233 302 713 429 / +233 302 935 158
        </a>

        <p className="mt-5 text-[13px] text-steel">
          Our team is ready to help you get what you need.
        </p>

        <Link
          href={`/financing?car=${car.id}`}
          className="mt-4 inline-block text-[13px] font-semibold text-brand hover:underline"
        >
          Check financing options for this car →
        </Link>
      </div>

      {open && <EnquiryModal car={car} onClose={() => setOpen(false)} />}
      {testDriveOpen && (
        <TestDriveModal car={car} onClose={() => setTestDriveOpen(false)} />
      )}
    </>
  );
}

function Feature({ label, sub }: { label: string; sub: string }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-graphite">{label}</p>
      <p className="text-[12px] text-steel">{sub}</p>
    </div>
  );
}

function EnquiryModal({ car, onClose }: { car: Car; onClose: () => void }) {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [phone, setPhone] = useState("");
  const [preferredContact, setPreferredContact] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const carLabel = `${car.year} ${car.make} ${car.model}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("Please confirm you agree to be contacted about this enquiry.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        car_id: car.id,
        name,
        email,
        phone,
        preferred_contact: preferredContact,
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
            {sent ? "Request sent" : "Request More Details"}
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
              Thank you, {name.split(" ")[0] || "there"}. A member of our
              team will reach out about the {carLabel} shortly.
            </p>
            <button onClick={onClose} className="btn-outline mt-6 w-full">
              Close
            </button>
          </div>
        ) : (
          <>
            <p className="mt-2 text-[14px] text-steel">
              Fill out the form below and our team will get back to you with
              more information about this vehicle.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <Honeypot value={website} onChange={setWebsite} />
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="enq-name">Full Name</label>
                  <input id="enq-name" required value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter Your Full Name" className="field-input" />
                </div>
                <div>
                  <label className="field-label" htmlFor="enq-email">Email Address</label>
                  <input id="enq-email" type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Your Email" className="field-input" />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="enq-phone">Phone Number</label>
                  <input id="enq-phone" required value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Your Phone Number" className="field-input" />
                </div>
                <div>
                  <label className="field-label" htmlFor="enq-contact">Preferred Contact Method</label>
                  <select id="enq-contact" required value={preferredContact}
                    onChange={(e) => setPreferredContact(e.target.value)} className="field-input">
                    <option value="">Select Preferred Method</option>
                    <option value="Phone">Phone</option>
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="field-label">I'm Interested In</label>
                <input value={carLabel} readOnly className="field-input bg-pearl text-steel" />
              </div>

              <div>
                <label className="field-label" htmlFor="enq-message">Message (Optional)</label>
                <textarea id="enq-message" rows={4} value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you'd like to know…" className="field-input" />
              </div>

              <label className="flex items-start gap-3 text-[13px] text-graphite">
                <input type="checkbox" checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-hairline accent-brand" />
                I agree to the{" "}
                <Link href="/privacy" className="text-brand hover:underline">
                  Privacy Policy
                </Link>{" "}
                and consent to being contacted regarding my enquiry.
              </label>

              {error && (
                <p className="text-[13px] text-brand" role="alert">{error}</p>
              )}

              <button type="submit" disabled={submitting} className="btn-brand w-full">
                {submitting ? "Sending…" : "Send Request"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
