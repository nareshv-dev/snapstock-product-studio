import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { gbp, priceOf, type Product } from "@/lib/catalog";
import { useWishlist } from "@/lib/store";
import { ProductIcon } from "./ornaments";

export function ProductCard({ p, className = "" }: { p: Product; className?: string }) {
  const w = useWishlist();
  const on = w.has(p.id);
  const sale = p.salePrice && p.salePrice < p.price;
  return (
    <div data-aos="fade-up" className={`group relative ${className}`}>
      <Link to="/product/$slug" params={{ slug: p.slug }} className="block">
        <div className="tile-frame overflow-hidden">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img src={p.images[0]} alt={p.name} loading="lazy" width={1024} height={1024} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            {p.stock === 0 && <span className="caps absolute left-2 top-2 bg-primary px-2 py-1 text-[0.6rem] text-primary-foreground">Sold out</span>}
            {sale && p.stock > 0 && <span className="caps absolute left-2 top-2 bg-accent px-2 py-1 text-[0.6rem] text-accent-foreground">Sale</span>}
            {p.isNew && !sale && p.stock > 0 && <span className="caps absolute left-2 top-2 bg-card/90 px-2 py-1 text-[0.6rem]">New</span>}
          </div>
        </div>
        <div className="mt-3 text-center">
          <h3 className="flex items-start justify-center gap-2 font-serif text-base leading-tight sm:text-lg">
            <ProductIcon name={p.icon} className="mt-1 h-4 w-4 shrink-0" />
            <span>{p.name}</span>
          </h3>
          <p className="mt-1 font-serif text-lg font-semibold">
            {sale ? (<><span className="mr-2 text-sm text-muted-foreground line-through">{gbp(p.price)}</span>{gbp(priceOf(p))}</>) : gbp(p.price)}
          </p>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => w.toggle(p.id)}
        aria-label={on ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
        aria-pressed={on}
        className="absolute right-3 top-3 rounded-full bg-card/90 p-2 shadow-sm transition hover:bg-card"
      >
        <Heart className={`h-4 w-4 ${on ? "fill-accent text-accent" : "text-foreground"}`} />
      </button>
    </div>
  );
}
