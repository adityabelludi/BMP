import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Lakshmi R.",
    city: "Bengaluru",
    text: "The Bisi Bele Bath powder tastes exactly like my ajji used to make. Pure, aromatic and no artificial smell. My family is hooked!",
  },
  {
    name: "Anand Kumar",
    city: "Hubballi",
    text: "Shenga chutney podi with jowar rotti — absolute North Karnataka bliss. Freshness you can actually taste. Ordering again already.",
  },
  {
    name: "Priya Nayak",
    city: "Mangaluru",
    text: "Finally a Sambar powder that isn't bitter. Balanced, rich and authentic. BMP has become a permanent part of my kitchen.",
  },
];

export function Testimonials() {
  return (
    <section className="section bg-cream-100 rangoli-bg">
      <div className="container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600">
            Loved across Karnataka
          </p>
          <h2 className="mt-3 heading-serif text-3xl font-bold md:text-4xl">
            What our customers say
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-cream-300 bg-white p-7 shadow-sm"
            >
              <Quote className="h-8 w-8 text-saffron-300" />
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-turmeric-500 text-turmeric-500"
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-maroon-700">
                “{t.text}”
              </blockquote>
              <figcaption className="mt-5 border-t border-cream-200 pt-4">
                <p className="font-semibold text-maroon-800">{t.name}</p>
                <p className="text-sm text-saffron-600">{t.city}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
