import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Ana sayfa ve liste bölümlerinin ortak başlık satırı. */
export function SectionHeading({
  title,
  description,
  href,
  linkLabel = "Tümünü Gör",
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-extrabold text-ink sm:text-xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-brand sm:text-sm"
        >
          {linkLabel}
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
