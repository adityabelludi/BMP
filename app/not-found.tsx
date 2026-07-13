import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-hero-warm px-6 text-center">
      <Logo />
      <p className="font-heading text-7xl font-bold text-saffron-500">404</p>
      <h1 className="heading-serif text-2xl font-bold">Page not found</h1>
      <p className="max-w-sm text-maroon-600">
        The page you're looking for has wandered off — like a pinch of masala in
        the wind.
      </p>
      <Button asChild size="lg">
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
