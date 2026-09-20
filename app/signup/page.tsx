"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Honeypot from "@/components/Honeypot";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, website }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not create your account.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="container-content flex min-h-[70vh] items-center justify-center py-16">
      <div className="card-soft w-full max-w-sm p-10">
        <h1 className="font-display text-[26px] text-graphite">Create an account</h1>
        <p className="mt-2 text-[14px] text-steel">
          Save favorite cars and keep track of your enquiries.
        </p>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg border border-hairline px-5 py-3 text-[14px] font-medium text-graphite transition-colors hover:border-brand"
        >
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-[12px] tracking-wide2 uppercase text-steel">
          <span className="h-px flex-1 bg-hairline" />
          or
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Honeypot value={website} onChange={setWebsite} />
          <div>
            <label className="field-label" htmlFor="name">Full Name</label>
            <input id="name" required value={name}
              onChange={(e) => setName(e.target.value)} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="email">Email</label>
            <input id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={8} value={password}
              onChange={(e) => setPassword(e.target.value)} className="field-input" />
            <p className="mt-1 text-[12px] text-steel">At least 8 characters.</p>
          </div>

          {error && (
            <p className="text-[13px] text-brand" role="alert">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-[14px] text-steel">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
