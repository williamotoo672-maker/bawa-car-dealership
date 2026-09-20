"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (status === "loading") {
    return <div className="h-9 w-9 rounded-full bg-pearl" />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-[13px] font-semibold tracking-wide2 uppercase text-graphite hover:text-brand"
        >
          Sign In
        </Link>
        <Link href="/signup" className="btn-brand py-2.5 px-5 text-[12px]">
          Sign Up
        </Link>
      </div>
    );
  }

  const initials = (session.user?.name || session.user?.email || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-[14px] font-semibold text-paper"
        aria-label="Account menu"
      >
        {session.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt=""
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-48 rounded-lg border border-hairline bg-paper py-2 shadow-lg">
          <div className="border-b border-hairline px-4 py-2">
            <p className="truncate text-[13px] font-medium text-graphite">
              {session.user?.name || "My Account"}
            </p>
            <p className="truncate text-[12px] text-steel">{session.user?.email}</p>
          </div>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="block w-full px-4 py-2.5 text-left text-[13px] text-graphite hover:bg-pearl hover:text-brand"
          >
            My Account
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full px-4 py-2.5 text-left text-[13px] text-graphite hover:bg-pearl hover:text-brand"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
