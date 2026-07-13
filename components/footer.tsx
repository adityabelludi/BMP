import Link from "next/link";
import { Logo } from "@/components/logo";
import { BRAND } from "@/lib/constants";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-10 border-t border-cream-300 bg-cream-100">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-4 md:col-span-2">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-maroon-600">
            {BRAND.fullName} brings you stone-ground, small-batch masalas made
            from time-honoured Karnataka recipes. Pure ingredients, no
            preservatives — just authentic flavour.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-maroon-800">
            Explore
          </h4>
          <ul className="space-y-2.5 text-sm text-maroon-600">
            <li>
              <Link href="/" className="hover:text-saffron-600">
                Home
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-saffron-600">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-saffron-600">
                Cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-maroon-800">
            Contact
          </h4>
          <ul className="space-y-3 text-sm text-maroon-600">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-saffron-500" /> {BRAND.email}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-saffron-500" />
              <span className="flex flex-col">
                <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} className="hover:text-saffron-600">
                  {BRAND.phone}
                </a>
                <a href={`tel:${BRAND.phoneAlt.replace(/\s/g, "")}`} className="hover:text-saffron-600">
                  {BRAND.phoneAlt}
                </a>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-saffron-500" /> {BRAND.location}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream-300">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-maroon-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {BRAND.fullName}. All rights reserved.
          </p>
          <p>{BRAND.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
