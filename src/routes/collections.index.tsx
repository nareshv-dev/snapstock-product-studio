import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeading } from "@/components/site/ornaments";
import { useStore, visibleProducts } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/collections/")({
  head: () => ({ meta: seo("Collections", "New arrivals, best sellers, gifts under £30, occasion bags and our limited artisans' edition.") }),
  component: Collections,
});

function Collections() {
  const { db } = useStore();
  const products = visibleProducts(db);
  const collections = db.collections.filter((c) => c.visible);

  return (
    <>
      <PageHeading eyebrow="Gray & Gable" title="Collections" />
      <section aria-label="Our collections" className="mx-auto max-w-6xl space-y-16 px-4 py-14 sm:space-y-24">
        {collections.map((c, i) => {
          const count = products.filter((p) => p.collections.includes(c.slug)).length;
          const flip = i % 2 === 1;
          return (
            <article
              key={c.slug}
              data-aos={flip ? "fade-left" : "fade-right"}
              className={`flex flex-col items-center gap-8 sm:gap-12 lg:flex-row ${flip ? "lg:flex-row-reverse" : ""}`}
            >
              <Link
                to="/collections/$slug"
                params={{ slug: c.slug }}
                className="group tile-frame block w-full overflow-hidden lg:w-3/5"
                aria-label={`Explore the ${c.name} collection`}
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
              </Link>
              <div className={`w-full text-center lg:w-2/5 ${flip ? "lg:text-right" : "lg:text-left"}`}>
                <p className="caps text-xs tracking-[0.3em] text-primary">
                  {String(i + 1).padStart(2, "0")} — {count} {count === 1 ? "piece" : "pieces"}
                </p>
                <h2 className="caps mt-3 text-2xl sm:text-3xl">{c.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{c.description}</p>
                <Link
                  to="/collections/$slug"
                  params={{ slug: c.slug }}
                  className="caps mt-6 inline-flex items-center gap-2 border-b border-primary pb-1 text-sm tracking-[0.2em] text-primary transition hover:gap-3"
                >
                  Explore collection <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
