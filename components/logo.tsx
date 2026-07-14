import Link from "next/link";
import Image from "next/image";
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
      <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-full shadow-sm ring-2 ring-turmeric-500/30 transition-transform group-hover:scale-105">
        <Image
          src="/logo.png"
          alt="BMP — Belludi Masala Products logo"
          fill
          sizes="44px"
          className="object-cover"
          priority
        />
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
