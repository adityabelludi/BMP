import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="BMP — Belludi Masala Products, home"
    >
      <span className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-saffron-500 to-maroon-500 text-white shadow-sm ring-2 ring-turmeric-500/30 transition-transform group-hover:scale-105">
        {/* Simple lotus/rangoli motif */}
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="M12 3c1.6 2.3 1.6 4.7 0 7-1.6-2.3-1.6-4.7 0-7Z" fill="currentColor" stroke="none" />
          <path d="M12 21c-3.5 0-6-2.2-6-5 2.4-.5 4.4.2 6 2 1.6-1.8 3.6-2.5 6-2 0 2.8-2.5 5-6 5Z" fill="currentColor" stroke="none" opacity="0.9" />
          <path d="M5 10c2.2.6 3.6 2 4.5 4M19 10c-2.2.6-3.6 2-4.5 4" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-heading text-lg font-bold tracking-tight text-maroon-800">
          BMP
        </span>
        {!compact && (
          <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-saffron-600">
            Belludi Masala Products
          </span>
        )}
      </span>
    </Link>
  );
}
