import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeading } from "@/components/site/ornaments";
import { ProductCard } from "@/components/site/product-card";
import { useStore, visibleProducts } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => (typeof s.q === "string" ? { q: s.q } : {}),
  head: () => ({ meta: seo("Search", "Search the Gray & Gable collection of handcrafted bags.") }),
  component: SearchPage,
});

function SearchPage() {
  const { q = "" } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const [term, setTerm] = useState(q);
  const { db } = useStore();
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const results = words.length ? visibleProducts(db).filter((p) => {
    const hay = `${p.name} ${p.description} ${p.materials} ${p.colour} ${p.category} ${p.tags.join(" ")}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  }) : [];
  return (
    <>
      <PageHeading title="Search">
        <form onSubmit={(e) => { e.preventDefault(); navigate({ search: { q: term.trim() } }); }} className="flex gap-2" role="search">
          <label htmlFor="q" className="sr-only">Search</label>
          <input id="q" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Try ‘kantha’ or ‘clutch’" className="flex-1 border border-input bg-card px-3 py-2.5 text-foreground" />
          <button className="caps bg-primary px-6 text-xs text-primary-foreground">Search</button>
        </form>
      </PageHeading>
      <div className="mx-auto max-w-7xl px-4 py-10">
        {q && <p className="mb-6 text-sm text-muted-foreground">{results.length} results for “{q}”</p>}
        {q && results.length === 0 && <p className="py-16 text-center font-serif text-2xl">Nothing found. Try another word, like “jute”.</p>}
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">{results.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </div>
    </>
  );
}
