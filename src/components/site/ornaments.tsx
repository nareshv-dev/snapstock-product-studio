import corner from "@/assets/botanical-corner.png";
import { Leaf, Flower2, Circle, Sparkles, ShoppingBag, Sprout, Rainbow } from "lucide-react";

export function Fleur({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`h-4 w-4 fill-current ${className}`}>
      <path d="M12 2c1.6 2 2.2 4 1.4 6.2 1.6-.9 3.6-.9 5 .6-1.8.2-3.2 1.2-3.8 2.8h-1.8c.2 1.8 1 3 2.4 3.6-1.2.6-2.4.4-3.2-.4L12 22l-.0-7.2c-.8.8-2 1-3.2.4 1.4-.6 2.2-1.8 2.4-3.6H9.4C8.8 10 7.4 9 5.6 8.8c1.4-1.5 3.4-1.5 5-.6C9.8 6 10.4 4 12 2z" />
    </svg>
  );
}

export function FleurRule({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-gold ${className}`} aria-hidden>
      <span className="h-px w-12 bg-gold/60 sm:w-20" />
      <Fleur />
      <span className="h-px w-12 bg-gold/60 sm:w-20" />
    </div>
  );
}

export function Corners({ bottom = false }: { bottom?: boolean }) {
  return (
    <>
      <img src={corner} alt="" aria-hidden className="pointer-events-none absolute left-0 top-0 w-24 opacity-70 sm:w-40 lg:w-52" />
      <img src={corner} alt="" aria-hidden className="pointer-events-none absolute right-0 top-0 w-24 -scale-x-100 opacity-70 sm:w-40 lg:w-52" />
      {bottom && <img src={corner} alt="" aria-hidden className="pointer-events-none absolute bottom-0 left-0 w-24 -scale-y-100 opacity-60 sm:w-36" />}
    </>
  );
}

export function Plaque({ size = "lg" }: { size?: "sm" | "lg" }) {
  if (size === "sm")
    return (
      <span className="plaque inline-flex h-10 w-10 items-center justify-center rounded-sm font-serif text-xl font-semibold tracking-[-0.15em]">
        <span className="gold-text">GG</span>
      </span>
    );
  return (
    <div className="inline-flex flex-col items-center">
      <div className="plaque flex h-24 w-28 items-center justify-center rounded-sm sm:h-28 sm:w-32">
        <span className="gold-text font-serif text-6xl font-semibold tracking-[-0.18em] sm:text-7xl">GG</span>
      </div>
      <div className="plaque -mt-1 rounded-b-xl px-6 py-1.5 text-center sm:px-8">
        <div className="gold-text caps text-lg font-semibold tracking-[0.18em] sm:text-xl">Gray &amp; Gable</div>
        <div className="caps text-[0.6rem] tracking-[0.5em] text-gold-soft">London</div>
      </div>
    </div>
  );
}

const icons: Record<string, typeof Leaf> = { leaf: Leaf, flower: Flower2, circle: Circle, star: Sparkles, bag: ShoppingBag, sprig: Sprout, arch: Rainbow };
export function ProductIcon({ name, className = "h-4 w-4" }: { name: string; className?: string }) {
  const I = icons[name] ?? Leaf;
  return <I className={`${className} text-gold`} strokeWidth={1.4} aria-hidden />;
}

export function PageHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-border/60 px-4 pb-10 pt-12 text-center sm:pt-16">
      <Corners />
      <div data-aos="fade-up">{eyebrow && <p className="caps text-xs text-muted-foreground">{eyebrow}</p>}
      <h1 className="mt-2 text-4xl sm:text-5xl">{title}</h1></div>
      <FleurRule className="mt-4" />
      {children && <div className="mx-auto mt-4 max-w-2xl text-muted-foreground">{children}</div>}
    </section>
  );
}
