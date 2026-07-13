"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";
import { Logo } from "@/components/logo";
import { CartSheet } from "@/components/cart-sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/#story", label: "Our Story" },
  { href: "/#why", label: "Why BMP" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-cream-300/70 bg-cream-100/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-saffron-100 text-saffron-700"
                    : "text-maroon-700 hover:bg-saffron-50"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/account"
            aria-label="My account"
            className="grid h-11 w-11 place-items-center rounded-full text-maroon-700 transition-colors hover:bg-saffron-50"
          >
            <User className="h-5 w-5" />
          </Link>
          <CartSheet />
          <button
            className="grid h-11 w-11 place-items-center rounded-full text-maroon-700 hover:bg-saffron-50 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-cream-300 bg-cream-100 md:hidden">
          <div className="container flex flex-col py-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-maroon-700 hover:bg-saffron-50"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
