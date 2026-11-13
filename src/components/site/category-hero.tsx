import type { Product } from "@/lib/catalog";
import { FleurRule } from "./ornaments";

const d = (ms: number) => ({ "--aos-delay": `${ms}ms` }) as React.CSSProperties;

/** Each category gets its own opening layout so the shop pages don't all look alike. */
export function CategoryHero({ slug, title, products }: { slug: string; title: string; products: Product[] }) {
  const pics = products.map((p) => p.images[0]).filter(Boolean);
  const [a, b, c, e] = pics;

  if (slug === "totes")
    return (
      <section className="relative flex min-h-[60vh] items-end overflow-hidden">
        <img src={a} alt="" className="hero-zoom absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/75 via-foreground/30 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 pt-32 text-primary-foreground sm:px-8">
          <p data-aos="fade-up" className="text-[0.7rem] uppercase tracking-[0.3em] opacity-85">Everyday carry · {products.length} pieces</p>
          <h1 data-aos="fade-up" style={d(150)} className="mt-4 text-6xl sm:text-7xl">{title}</h1>
          <p data-aos="fade-up" style={d(300)} className="mt-4 max-w-md opacity-90">Roomy jute and kantha totes for market mornings, work days and weekends away.</p>
        </div>
      </section>
    );

  if (slug === "crossbody")
    return (
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:grid-cols-[1fr_1.2fr]">
        <div data-aos="fade-right">
          <p className="caps text-xs text-gold">Hands-free heritage</p>
          <h1 className="mt-3 text-5xl sm:text-6xl">{title}</h1>
          <FleurRule className="mt-5 justify-start" />
          <p className="mt-5 max-w-sm text-muted-foreground">Light, adjustable and made to move with you, from Marylebone to the market.</p>
          <p className="mt-8 font-serif text-7xl text-gold/70">{String(products.length).padStart(2, "0")}</p>
          <p className="caps text-[0.6rem] text-muted-foreground">Styles available</p>
        </div>
        <div className="grid grid-cols-2 items-start gap-4">
          {[a, b].map((src, i) => src && (
            <div key={i} data-aos="fade-up" style={d(i * 200)} className={`tile-frame ${i ? "mt-12" : ""}`}>
              <img src={src} alt="" className="aspect-[3/4] w-full object-cover" />
            </div>
          ))}
        </div>
      </section>
    );

  if (slug === "statement")
    return (
      <section className="bg-primary px-4 py-16 text-center text-primary-foreground">
        <p data-aos="fade-down" className="caps text-xs text-gold-soft">Mirror-work · Banjara · Bamboo</p>
        <h1 data-aos="zoom-in" className="mt-3 text-6xl sm:text-7xl">{title}</h1>
        <p data-aos="fade-up" className="mx-auto mt-4 max-w-lg opacity-80">Bold, one-of-a-kind pieces that finish the outfit.</p>
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-3 gap-3 sm:gap-6">
          {[a, b, c].map((src, i) => src && (
            <img key={i} data-aos="fade-up" style={d(i * 150)} src={src} alt="" className={`aspect-[3/4] w-full border border-gold/40 object-cover ${i === 1 ? "sm:-translate-y-6" : ""}`} />
          ))}
        </div>
      </section>
    );

  if (slug === "clutches")
    return (
      <section className="px-4 py-14 text-center">
        <div className="flex justify-center -space-x-6">
          {[a, b, c, e].map((src, i) => src && (
            <img key={i} data-aos="zoom-in" style={d(i * 120)} src={src} alt="" className="h-24 w-24 rounded-full border-4 border-card object-cover shadow-md sm:h-32 sm:w-32" />
          ))}
        </div>
        <h1 data-aos="fade-up" className="mt-8 text-5xl italic sm:text-6xl">{title}</h1>
        <FleurRule className="mt-4" />
        <p data-aos="fade-up" className="mx-auto mt-4 max-w-md text-muted-foreground">Small, embroidered and made for evenings out, gifting and the little things.</p>
      </section>
    );

  return null;
}
