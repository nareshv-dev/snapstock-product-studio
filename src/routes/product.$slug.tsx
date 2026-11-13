import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, Minus, Plus, Star, Truck, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FleurRule, ProductIcon } from "@/components/site/ornaments";
import { ProductCard } from "@/components/site/product-card";
import { CATEGORIES, gbp, priceOf, seedProducts } from "@/lib/catalog";
import { uid, useCart, useStore, useWishlist, visibleProducts } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const p = seedProducts().find((x) => x.slug === params.slug);
    return { meta: seo(p?.name ?? "Handbag", p?.description ?? "A handcrafted Gray & Gable bag.") };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { db, set } = useStore();
  const cart = useCart();
  const navigate = useNavigate();
  const wish = useWishlist();
  const p = db.products.find((x) => x.slug === slug && x.status !== "draft");
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [review, setReview] = useState({ name: "", rating: 5, text: "" });
  if (!p) return <div className="py-32 text-center"><h1 className="text-4xl">This bag isn't available</h1><Link to="/shop" className="caps mt-4 inline-block text-xs underline">Back to shop</Link></div>;
  const inCart = db.cart.find((c) => c.productId === p.id)?.qty ?? 0;
  const maxQty = Math.max(0, p.stock - inCart);
  const reviews = db.reviews.filter((r) => r.productId === p.id && r.status === "approved");
  const related = visibleProducts(db).filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4);
  const low = p.stock > 0 && p.stock <= db.settings.lowStock;
  const add = () => {
    if (qty > maxQty) return toast.error(`Only ${p.stock} available.`);
    cart.add(p.id, qty);
    toast.success(`${p.name} added to your bag`, { action: { label: "View bag", onClick: () => navigate({ to: "/cart" }) } });
  };
  const buyNow = () => {
    if (qty > maxQty) return toast.error(`Only ${p.stock} available.`);
    cart.add(p.id, qty);
    if (db.sessionUserId) navigate({ to: "/checkout" });
    else { toast("Please sign in to complete your purchase."); navigate({ to: "/login", search: { redirect: "/checkout" } }); }
  };
  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (review.name.trim().length < 2 || review.text.trim().length < 5) return toast.error("Please add your name and a short review.");
    set((d) => ({ ...d, reviews: [...d.reviews, { id: uid("r"), productId: p.id, name: review.name.trim().slice(0, 60), rating: review.rating, text: review.text.trim().slice(0, 600), status: "pending", date: new Date().toISOString().slice(0, 10) }] }));
    setReview({ name: "", rating: 5, text: "" });
    toast.success("Thank you — your review will appear once approved.");
  };
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-gold">Home</Link> / <Link to="/shop" search={{ category: p.category }} className="hover:text-gold">{CATEGORIES.find((c) => c.slug === p.category)?.name}</Link> / <span>{p.name}</span>
      </nav>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div>
          <div className="tile-frame"><img src={p.images[img] ?? p.images[0]} alt={p.name} width={1024} height={1024} className="aspect-square w-full object-cover" /></div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {p.images.map((src, i) => (
              <button key={i} onClick={() => setImg(i)} aria-label={`Show image ${i + 1}`} className={`tile-frame ${i === img ? "ring-2 ring-gold" : ""}`}>
                <img src={src} alt="" loading="lazy" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="caps flex items-center gap-2 text-xs text-muted-foreground"><ProductIcon name={p.icon} /> {p.sku}</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">{p.name}</h1>
          <p className="mt-3 font-serif text-3xl font-semibold">
            {p.salePrice && p.salePrice < p.price && <span className="mr-3 text-xl text-muted-foreground line-through">{gbp(p.price)}</span>}
            {gbp(priceOf(p))}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Including VAT</p>
          <FleurRule className="mt-5 justify-start" />
          <p className="mt-5 leading-relaxed">{p.description}</p>
          <p className={`mt-5 text-sm font-semibold ${p.stock === 0 ? "text-destructive" : low ? "text-accent" : "text-foreground"}`}>
            {p.stock === 0 ? "Sold out" : low ? `Only ${p.stock} left in stock` : "In stock — ready to dispatch"}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-input bg-card">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center" aria-live="polite">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(Math.max(1, maxQty), q + 1))} className="p-3" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
            </div>
            <button disabled={p.stock === 0 || maxQty === 0} onClick={add} className="caps flex-1 bg-primary px-8 py-3.5 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {p.stock === 0 ? "Sold out" : maxQty === 0 ? "All stock in your bag" : "Add to bag"}
            </button>
            <button onClick={() => { wish.toggle(p.id); toast(wish.has(p.id) ? "Removed from wishlist" : "Saved to wishlist"); }} className="border border-input bg-card p-3.5" aria-label="Toggle wishlist" aria-pressed={wish.has(p.id)}>
              <Heart className={`h-4 w-4 ${wish.has(p.id) ? "fill-accent text-accent" : ""}`} />
            </button>
          </div>
          <div className="mt-3">
            <button disabled={p.stock === 0 || maxQty === 0} onClick={buyNow} className="caps w-full border border-primary px-8 py-3.5 text-xs transition hover:bg-primary hover:text-primary-foreground disabled:opacity-50">Buy now</button>
          </div>
          <div className="mt-6 grid gap-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-gold" /> Free UK delivery over £75 · Royal Mail Tracked 2–3 days</p>
            <p className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-gold" /> 30-day returns on unused items</p>
          </div>
          <Accordion type="multiple" defaultValue={["materials"]} className="mt-6">
            <AccordionItem value="materials"><AccordionTrigger className="caps text-xs">Materials</AccordionTrigger><AccordionContent>{p.materials}. Colour: {p.colour}.</AccordionContent></AccordionItem>
            <AccordionItem value="dims"><AccordionTrigger className="caps text-xs">Dimensions</AccordionTrigger><AccordionContent>{p.dimensions}</AccordionContent></AccordionItem>
            <AccordionItem value="care"><AccordionTrigger className="caps text-xs">Care</AccordionTrigger><AccordionContent>{p.care}</AccordionContent></AccordionItem>
            <AccordionItem value="delivery"><AccordionTrigger className="caps text-xs">Delivery &amp; returns</AccordionTrigger><AccordionContent>UK standard £4.95 (free over £75), express £9.95. EU delivery 4–7 working days. Return within 30 days for a full refund. <Link to="/shipping-returns" className="underline">Full details</Link></AccordionContent></AccordionItem>
          </Accordion>
        </div>
      </div>

      <section className="mt-20 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-3xl">Reviews</h2>
          {reviews.length === 0 && <p className="mt-3 text-muted-foreground">No reviews yet — be the first.</p>}
          <ul className="mt-4 space-y-5">
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-border pb-4">
                <div className="flex gap-0.5" aria-label={`${r.rating} out of 5`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-gold text-gold" : "text-border"}`} />)}</div>
                <p className="mt-2">{r.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.name} · {r.date}</p>
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={submitReview} className="space-y-3 border border-border bg-card p-6">
          <h3 className="text-2xl">Write a review</h3>
          <label className="block text-sm">Name<input value={review.name} onChange={(e) => setReview({ ...review, name: e.target.value })} maxLength={60} className="mt-1 w-full border border-input bg-background px-3 py-2" /></label>
          <label className="block text-sm">Rating
            <select value={review.rating} onChange={(e) => setReview({ ...review, rating: +e.target.value })} className="mt-1 w-full border border-input bg-background px-3 py-2">
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
            </select>
          </label>
          <label className="block text-sm">Review<textarea value={review.text} onChange={(e) => setReview({ ...review, text: e.target.value })} maxLength={600} rows={3} className="mt-1 w-full border border-input bg-background px-3 py-2" /></label>
          <button className="caps bg-primary px-6 py-2.5 text-xs text-primary-foreground">Submit review</button>
        </form>
      </section>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-center text-3xl">You may also love</h2>
          <FleurRule className="mt-3" />
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
    </div>
  );
}
