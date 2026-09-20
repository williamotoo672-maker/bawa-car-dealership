"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export default function BookingStatusSelect({
  id,
  status,
}: {
  id: number;
  status: string;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setCurrent(next);
    setSaving(true);
    const res = await fetch(`/api/test-drives/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    if (res.ok) router.refresh();
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      disabled={saving}
      className="rounded-full border border-hairline bg-paper px-3 py-1 text-[12px] capitalize text-graphite"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
