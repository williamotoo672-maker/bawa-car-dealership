import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-hairline bg-pearl">
      <div className="container-content grid gap-12 py-16 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="font-display text-[22px]">
            Bawa <span className="italic text-brand">Cardealership</span>
          </div>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-steel">
            A hand-picked collection of exceptional vehicles, backed by a
            team that treats every sale like a first impression that has to
            last.
          </p>
        </div>

        <div>
          <div className="field-label">Visit</div>
          <p className="text-[15px] leading-relaxed text-ink">
            14 Liberation Road
            <br />
            Airport Residential Area
            <br />
            Accra, Ghana
          </p>
        </div>

        <div>
          <div className="field-label">Reach Us</div>
          <p className="text-[15px] leading-relaxed text-ink">
            <a href="tel:+233200000000" className="hover:text-brand">
              +233 20 000 0000
            </a>
            <br />
            <a href="mailto:hello@bawacardealership.com" className="hover:text-brand">
              hello@bawacardealership.com
            </a>
            <br />
            Mon – Sat, 9am – 6pm
          </p>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="container-content flex flex-col items-center justify-between gap-3 py-6 text-[12px] tracking-wide2 uppercase text-steel md:flex-row">
          <span>© {new Date().getFullYear()} Bawa Cardealership. All rights reserved.</span>
          <Link href="/admin/login" className="hover:text-brand normal-case tracking-normal">
            Dealer Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
