import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeading } from "@/components/site/ornaments";
import { ProductCard } from "@/components/site/product-card";
import { useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: seo("Wishlist", "Your saved Gray & Gable bags.") }),
  component: Wishlist,
});

function Wishlist() {
  const { db } = useStore();
  const items = db.products.filter((p) => db.wishlist.includes(p.id) && p.status === "active");
  return (
    <>
      <PageHeading title="Your Wishlist" />
      <div className="mx-auto max-w-7xl px-4 py-10">
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-serif text-2xl">Nothing saved yet</p>
            <p className="mt-2 text-muted-foreground">Tap the heart on any bag to keep it here.</p>
            <Link to="/shop" className="caps mt-6 inline-block bg-primary px-8 py-3 text-xs text-primary-foreground">Browse bags</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        )}
      </div>
    </>
  );
}
