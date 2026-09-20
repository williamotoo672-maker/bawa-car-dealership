"use client";

import { useState } from "react";
import Link from "next/link";
import UserMenu from "./UserMenu";

const links = [
  { href: "/inventory", label: "Inventory" },
  { href: "/financing", label: "Financing" },
  { href: "/#why-bawa", label: "Why Bawa" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/95 backdrop-blur">
      <div className="container-content flex h-20 items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2" onClick={() => setMenuOpen(false)}>
          <span className="font-display text-[22px] tracking-tight text-graphite">
            Bawa
          </span>
          <span className="font-display text-[22px] italic text-brand">
            Cardealership
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-semibold tracking-wide2 uppercase text-graphite transition-colors hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <UserMenu />
          <Link href="/inventory" className="btn-primary py-2.5 px-5 text-[12px]">
            View Inventory
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-hairline md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 4l12 12M16 4L4 16" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-hairline bg-paper md:hidden">
          <div className="container-content flex flex-col gap-1 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-2 py-3 text-[14px] font-semibold uppercase tracking-wide2 text-graphite hover:bg-pearl hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/inventory"
              onClick={() => setMenuOpen(false)}
              className="btn-primary mt-3 w-full"
            >
              View Inventory
            </Link>
            <div className="mt-4 border-t border-hairline pt-4">
              <UserMenu />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
