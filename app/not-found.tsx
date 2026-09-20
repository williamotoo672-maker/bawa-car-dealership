import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-content flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="font-display text-[38px] text-graphite">
        This page has driven off.
      </h1>
      <p className="mt-3 max-w-sm text-[15px] text-steel">
        We couldn't find what you were looking for. It may have been sold or
        the link may be out of date.
      </p>
      <Link href="/inventory" className="btn-primary mt-8">
        Browse the Collection
      </Link>
    </div>
  );
}
