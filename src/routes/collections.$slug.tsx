import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeading } from "@/components/site/ornaments";
import { ProductBrowser } from "@/components/site/product-browser";
import { seedCollections } from "@/lib/catalog";
import { useStore, visibleProducts } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/collections/$slug")({
  head: ({ params }) => {
    const c = seedCollections().find((x) => x.slug === params.slug);
    return { meta: seo(c?.name ?? "Collection", c?.description ?? "A curated Gray & Gable collection.") };
  },
  component: CollectionPage,
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const { db } = useStore();
  const c = db.collections.find((x) => x.slug === slug);
  if (!c) return <div className="py-32 text-center"><h1 className="text-4xl">Collection not found</h1><Link to="/collections" className="caps mt-4 inline-block text-xs underline">All collections</Link></div>;
  return (
    <>
      <PageHeading eyebrow="Collection" title={c.name}>{c.description}</PageHeading>
      <ProductBrowser products={visibleProducts(db).filter((p) => p.collections.includes(slug))} />
    </>
  );
}
