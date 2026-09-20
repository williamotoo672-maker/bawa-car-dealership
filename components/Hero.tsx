import Link from "next/link";

const VIDEO_SRC = "https://assets.mixkit.co/videos/35156/35156-360.mp4";
const POSTER_SRC =
  "https://images.unsplash.com/photo-0Ny7pLX7WVs?q=80&w=1800&auto=format&fit=crop";

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden bg-graphite text-paper">
      {/* Poster shown instantly, and kept as the background for browsers/
          users (reduced motion) that don't get the video layer. */}
      <div
        className="absolute inset-0 bg-cover bg-center grayscale"
        style={{ backgroundImage: `url(${POSTER_SRC})` }}
      />

      <video
        className="absolute inset-0 h-full w-full object-cover grayscale motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        poster={POSTER_SRC}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Dark gradient so white text stays readable over any frame */}
      <div className="absolute inset-0 bg-gradient-to-b from-graphite/70 via-graphite/55 to-graphite/85" />

      <div className="container-content relative z-10 py-28 text-center">
        <p className="text-[13px] font-semibold tracking-wide2 uppercase text-paper/80">
          Your Place for Great Cars
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl font-display text-[40px] font-semibold uppercase leading-[1.1] text-paper sm:text-[54px] lg:text-[64px]">
          Your Trusted Automotive Partner in Ghana
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-paper/85">
          From quality vehicles to servicing, parts, and sourcing support,
          Bawa Cardealership helps individuals and businesses move with
          confidence.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link href="/inventory" className="btn-brand">
            Browse Vehicles →
          </Link>
          <Link
            href="/#contact"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-paper/40 px-7 py-3.5 text-[13px] font-semibold tracking-wide2 uppercase text-paper transition-colors duration-300 hover:border-paper hover:bg-paper/10"
          >
            Talk to Our Team
          </Link>
        </div>
      </div>

      {/* Giant faded brand watermark bleeding off the bottom edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-6 z-0 select-none overflow-hidden text-center sm:-bottom-10 lg:-bottom-16"
      >
        <span className="font-display text-[64px] font-semibold uppercase leading-none text-paper/10 sm:text-[110px] lg:text-[160px]">
          Bawa Cardealership
        </span>
      </div>
    </section>
  );
}
