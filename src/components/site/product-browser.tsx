import { useMemo, useState } from "react";
import { CATEGORIES, priceOf, type Product } from "@/lib/catalog";
import { ProductCard } from "./product-card";

type Sort = "featured" | "price-asc" | "price-desc" | "newest" | "name";

export function ProductBrowser({ products, category, onCategory }: { products: Product[]; category?: string; onCategory?: (c?: string) => void }) {
  const [sort, setSort] = useState<Sort>("featured");
  const [maxPrice, setMaxPrice] = useState(70);
  const [colours, setColours] = useState<string[]>([]);
  const [inStock, setInStock] = useState(false);
  const [shown, setShown] = useState(8);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const allColours = useMemo(() => Array.from(new Set(products.map((p) => p.colour))).sort(), [products]);

  const list = useMemo(() => {
    let l = products.filter((p) => (!category || p.category === category) && priceOf(p) <= maxPrice && (!colours.length || colours.includes(p.colour)) && (!inStock || p.stock > 0));
    const by: Record<Sort, (a: Product, b: Product) => number> = {
      featured: (a, b) => Number(b.featured) - Number(a.featured),
      "price-asc": (a, b) => priceOf(a) - priceOf(b),
      "price-desc": (a, b) => priceOf(b) - priceOf(a),
      newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    l = [...l].sort(by[sort]);
    return l;
  }, [products, category, maxPrice, colours, inStock, sort]);

  const reset = () => { setMaxPrice(70); setColours([]); setInStock(false); onCategory?.(undefined); };
  const filters = (
    <div className="space-y-7">
      {onCategory && (
        <fieldset>
          <legend className="caps text-xs font-semibold">Category</legend>
          <div className="mt-3 space-y-2 text-sm">
            {[{ slug: undefined, name: "All bags" }, ...CATEGORIES].map((c) => (
              <label key={c.name} className="flex cursor-pointer items-center gap-2">
                <input type="radio" name="cat" checked={category === c.slug} onChange={() => onCategory(c.slug)} className="accent-[var(--gold)]" /> {c.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset>
        <legend className="caps text-xs font-semibold">Max price: £{maxPrice}</legend>
        <input aria-label="Maximum price" type="range" min={15} max={70} step={5} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="mt-3 w-full accent-[var(--gold)]" />
      </fieldset>
      <fieldset>
        <legend className="caps text-xs font-semibold">Colour</legend>
        <div className="mt-3 space-y-2 text-sm">
          {allColours.map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={colours.includes(c)} onChange={() => setColours((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))} className="accent-[var(--gold)]" /> {c}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="caps text-xs font-semibold">Availability</legend>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="accent-[var(--gold)]" /> In stock only
        </label>
      </fieldset>
      <button onClick={reset} className="caps text-xs underline underline-offset-4 hover:text-gold">Clear filters</button>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="hidden lg:block">{filters}</aside>
      <div>
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <p className="min-w-0 truncate text-sm text-muted-foreground">{list.length} {list.length === 1 ? "bag" : "bags"}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setFiltersOpen((o) => !o)} className="caps border border-border px-3 py-2 text-xs lg:hidden" aria-expanded={filtersOpen}>Filters</button>
            <label htmlFor="sort" className="sr-only">Sort by</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="border border-input bg-card px-3 py-2 text-sm">
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>
        {filtersOpen && <div className="mb-8 border border-border bg-card p-5 lg:hidden">{filters}</div>}
        {list.length === 0 ? (
          <div className="border border-dashed border-border py-20 text-center">
            <p className="font-serif text-2xl">No bags match these filters</p>
            <button onClick={reset} className="caps mt-4 text-xs underline">Clear filters</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
              {list.slice(0, shown).map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
            {shown < list.length && (
              <div className="mt-12 text-center">
                <button onClick={() => setShown((s) => s + 8)} className="caps border border-foreground px-8 py-3 text-xs hover:bg-foreground hover:text-background">Load more</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
