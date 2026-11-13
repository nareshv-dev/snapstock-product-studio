import { createFileRoute, Link } from "@tanstack/react-router";
import artisan from "@/assets/artisan-craft.jpg";
import lifestyle from "@/assets/lifestyle-london.jpg";
import { FleurRule, PageHeading } from "@/components/site/ornaments";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: seo("Our Story", "How Gray & Gable London brings artisan kantha, jute and mirror-work bags to modern wardrobes.") }),
  component: About,
});

function About() {
  return (
    <>
      <PageHeading eyebrow="Since 2019" title="Our Story">Heritage craftsmanship, natural materials, modern luxury.</PageHeading>
      <div className="mx-auto max-w-6xl space-y-20 px-4 py-14">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="tile-frame"><img src={artisan} alt="Artisan hand-embroidering" loading="lazy" className="w-full" /></div>
          <div>
            <h2 className="text-4xl">A studio in Marylebone</h2>
            <FleurRule className="mt-3 justify-start" />
            <p className="mt-4 leading-relaxed text-muted-foreground">Founders Eleanor Gray and Thomas Gable met over a shared love of textiles: she a London accessories designer, he a collector of vintage quilts. Their first kantha tote sold out in a weekend at Portobello Market, and Gray &amp; Gable was born.</p>
            <p className="mt-3 leading-relaxed text-muted-foreground">Today we work with small family workshops whose embroidery, quilting and mirror-work techniques have been passed down for generations. We pay fairly, order in small batches and finish every piece in London.</p>
          </div>
        </div>
        <div className="grid gap-6 text-center sm:grid-cols-3">
          {[["Fair partnerships", "Long-term relationships with artisan families, paid above fair-trade rates."], ["Natural materials", "Jute, upcycled cotton, seagrass and bamboo: renewable and biodegradable."], ["Made to last", "Reinforced seams and leather trims, with free repairs for the first year."]].map(([t, d]) => (
            <div key={t} className="border border-border bg-card p-8"><h3 className="text-2xl">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>
          ))}
        </div>
        <div className="tile-frame"><img src={lifestyle} alt="" loading="lazy" className="h-80 w-full object-cover" /></div>
        <div className="text-center"><Link to="/shop" className="caps bg-primary px-8 py-3 text-xs text-primary-foreground">Explore the collection</Link></div>
      </div>
    </>
  );
}
