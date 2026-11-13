import { createFileRoute, Link } from "@tanstack/react-router";
import { Hammer, Leaf, Truck, Gem } from "lucide-react";
import artisan from "@/assets/artisan-craft.jpg";
import heroImg from "@/assets/hero-campaign.jpg";
import lifestyle from "@/assets/lifestyle-london.jpg";
import skyline from "@/assets/london-skyline.png";
import { FleurRule, Fleur } from "@/components/site/ornaments";
import { ProductCard } from "@/components/site/product-card";
import { useStore, visibleProducts } from "@/lib/store";
import { seo } from "@/lib/seo";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({ meta: seo("Heritage Handbags, Handcrafted", "Jute, kantha, Banjara mirror-work and bamboo-handle bags, made by artisans and finished in London.") }),
  component: Home,
});

function Home() {
  const { db } = useStore();
  const all = visibleProducts(db);
  const featured = all.filter((p) => p.featured);
  const grid = (featured.length >= 12 ? featured : all).slice(0, 12);
  const rows = [grid.slice(0, 4), grid.slice(4, 9), grid.slice(9, 12)];
  const right = db.content.heroRight.split("|");
  const best = all.filter((p) => p.bestSeller).slice(0, 4);
  const cols = db.collections.filter((c) => c.visible && c.featured);

  return (
    <>
      {/* Hero: full-bleed campaign image, content bottom-left */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden">
        <img src={heroImg} alt="A woman in a London townhouse carrying an embroidered jute bag with bamboo handles" width={1920} height={1088} className="hero-zoom absolute inset-0 h-full w-full object-cover object-[70%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/75 via-foreground/35 to-foreground/5" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-foreground/50 to-transparent" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-40 text-primary-foreground sm:px-8 sm:pb-24">
          <p data-aos="fade-up" className="text-[0.7rem] uppercase tracking-[0.3em] text-primary-foreground/85">Heritage handbags · Marylebone, London</p>
          <h1 data-aos="fade-up" style={{ "--aos-delay": "150ms" } as React.CSSProperties} className="mt-6 max-w-2xl text-6xl leading-[1.02] sm:text-7xl lg:text-8xl">Carried by Hand,<br />Made to Last</h1>
          <p data-aos="fade-up" style={{ "--aos-delay": "300ms" } as React.CSSProperties} className="mt-6 max-w-md leading-relaxed text-primary-foreground/90">{db.content.heroTagline}. Jute, kantha and bamboo bags, stitched by artisans and finished in London.</p>
          <div data-aos="fade-up" style={{ "--aos-delay": "450ms" } as React.CSSProperties} className="mt-10 flex flex-wrap gap-3">
            <Link to="/shop" className="caps bg-card px-8 py-4 text-xs text-foreground transition hover:bg-gold hover:text-primary-foreground">{db.content.heroCta}</Link>
            <Link to="/collections" className="caps border border-primary-foreground/70 px-8 py-4 text-xs transition hover:bg-primary-foreground/10">View collections</Link>
          </div>
          <p data-aos="fade-up" style={{ "--aos-delay": "600ms" } as React.CSSProperties} className="mt-8 text-sm text-primary-foreground/85">4.9 ★ from 1,200+ happy customers · Free UK delivery over £75</p>
        </div>
      </section>

      {/* Product mosaic: 4 / 5 / 3 + brand panel */}
      <section className="mx-auto mt-20 max-w-7xl px-4" aria-label="Featured bags">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {rows[0].map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-5">
          {rows[1].map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {rows[2].map((p) => <ProductCard key={p.id} p={p} />)}
          <div data-aos="fade-up" className="relative col-span-2 flex flex-col items-center justify-between overflow-hidden pt-6 text-center md:col-span-1">
            <div>
              <p className="caps text-xs leading-relaxed text-muted-foreground">{db.content.brandPanel}</p>
              <Fleur className="mx-auto my-2 text-gold" />
              <p className="caps text-2xl font-semibold">Gray &amp; Gable</p>
              <p className="caps text-[0.65rem] tracking-[0.5em] text-muted-foreground">London</p>
            </div>
            <img src={skyline} alt="" aria-hidden loading="lazy" width={1600} height={608} className="mt-4 w-full opacity-70" />
          </div>
        </div>
      </section>

      {/* Offer */}
      <section className="mx-auto mt-24 max-w-6xl px-4">
        <div data-aos="zoom-in" className="relative overflow-hidden bg-primary px-6 py-14 text-center text-primary-foreground sm:px-16">
          <div className="absolute inset-3 border border-gold/50" aria-hidden />
          <p className="caps relative text-xs text-gold-soft">Limited time offer</p>
          <h2 className="relative mt-3 text-4xl sm:text-6xl">10% off your first bag</h2>
          <p className="relative mx-auto mt-4 max-w-md opacity-85">Use the code below at checkout. Free UK delivery on orders over £75.</p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => { navigator.clipboard?.writeText("HERITAGE10"); toast.success("Code HERITAGE10 copied"); }} className="caps border border-dashed border-gold px-6 py-3 text-sm tracking-[0.3em] text-gold-soft hover:bg-gold/10">HERITAGE10</button>
            <Link to="/shop" className="caps bg-card px-8 py-3.5 text-xs text-foreground hover:bg-gold hover:text-primary-foreground">Shop now</Link>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="mx-auto mt-24 max-w-7xl px-4">
        <div data-aos="fade-up" className="text-center">
          <p className="caps text-xs text-muted-foreground">Curated for you</p>
          <h2 className="mt-2 text-4xl">Featured Collections</h2>
          <FleurRule className="mt-3" />
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cols.map((c) => (
            <Link data-aos="zoom-in" key={c.slug} to="/collections/$slug" params={{ slug: c.slug }} className="group tile-frame block">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={c.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-4 pt-16 text-center">
                  <h3 className="caps text-sm text-primary-foreground sm:text-base">{c.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand story */}
      <section className="mx-auto mt-24 grid max-w-7xl items-center gap-10 px-4 md:grid-cols-2">
        <div data-aos="fade-right" className="tile-frame"><img src={artisan} alt="An artisan hand-embroidering flowers onto jute" loading="lazy" width={1600} height={1008} className="w-full" /></div>
        <div data-aos="fade-left" className="text-center md:text-left">
          <p className="caps text-xs text-muted-foreground">Our story</p>
          <h2 className="mt-2 text-4xl sm:text-5xl">Made slowly, by hand, to last</h2>
          <FleurRule className="mt-4 md:justify-start" />
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Gray &amp; Gable began in a Marylebone studio with a single kantha tote and a simple idea: that the most beautiful bags carry the marks of the hands that made them. Today we partner with small artisan workshops to create pieces in natural jute, upcycled cotton and bamboo — each one finished and inspected in London.
          </p>
          <Link to="/about" className="caps mt-6 inline-block border-b border-gold pb-1 text-xs text-foreground hover:text-gold">Discover our heritage</Link>
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="mx-auto mt-24 max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
          {[
            [Hammer, "Heritage craftsmanship", "Hand-stitched kantha, embroidery and mirror-work."],
            [Leaf, "Natural materials", "Jute, cotton, seagrass and real bamboo."],
            [Gem, "One of a kind", "Patchwork pieces are never repeated."],
            [Truck, "Free UK delivery", "On orders over £75, with easy returns."],
          ].map(([I, t, d]) => {
            const Icon = I as typeof Leaf;
            return (
              <div data-aos="fade-up" key={t as string} className="border border-border bg-card/60 p-6">
                <Icon className="mx-auto h-7 w-7 text-gold" strokeWidth={1.3} />
                <h3 className="mt-3 text-xl">{t as string}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Best sellers */}
      <section className="mx-auto mt-24 max-w-7xl px-4">
        <div data-aos="fade-up" className="text-center">
          <p className="caps text-xs text-muted-foreground">Most loved</p>
          <h2 className="mt-2 text-4xl">Best Sellers</h2>
          <FleurRule className="mt-3" />
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {best.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Lifestyle banner */}
      <section className="relative mt-24 overflow-hidden">
        <img src={lifestyle} alt="A woman carrying an embroidered jute tote on a London street" loading="lazy" width={1600} height={912} className="h-[420px] w-full object-cover sm:h-[520px]" />
        <div className="absolute inset-0 flex items-center justify-start bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent px-6 sm:px-16">
          <div data-aos="fade-right" className="max-w-md text-primary-foreground">
            <p className="caps text-xs">From the studio to the street</p>
            <h2 className="mt-2 text-4xl sm:text-5xl">Carry a little heritage, every day</h2>
            <Link to="/collections/$slug" params={{ slug: "everyday-essentials" }} className="caps mt-6 inline-block bg-card px-6 py-3 text-xs text-foreground hover:bg-card/90">Everyday essentials</Link>
          </div>
        </div>
      </section>
    </>
  );
}
