import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeading } from "@/components/site/ornaments";
import { CategoryHero } from "@/components/site/category-hero";
import { ProductBrowser } from "@/components/site/product-browser";
import { CATEGORIES } from "@/lib/catalog";
import { useStore, visibleProducts } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): { category?: string } => (typeof s.category === "string" ? { category: s.category } : {}),
  head: () => ({ meta: seo("Shop All Bags", "Browse totes, crossbody, statement bags and clutches — handcrafted in jute, kantha and mirror-work.") }),
  component: Shop,
});

function Shop() {
  const { category } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { db } = useStore();
  const cat = CATEGORIES.find((c) => c.slug === category);
  return (
    <>
      {cat ? (
        <CategoryHero key={cat.slug} slug={cat.slug} title={cat.name} products={visibleProducts(db).filter((p) => p.category === cat.slug)} />
      ) : (
        <PageHeading eyebrow="The collection" title="Shop All Bags">Every piece is handmade, so tiny variations are part of its character.</PageHeading>
      )}
      <ProductBrowser products={visibleProducts(db)} category={cat?.slug} onCategory={(c) => navigate({ search: c ? { category: c } : {} })} />
    </>
  );
}
