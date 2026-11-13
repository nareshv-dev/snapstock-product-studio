import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeading } from "@/components/site/ornaments";
import { gbp } from "@/lib/catalog";
import { cartTotals, useCart, useStore, validatePromo } from "@/lib/store";
import { PROMO_KEY, today } from "@/lib/checkout";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: seo("Your Bag", "Review the items in your Gray & Gable shopping bag.") }),
  component: Cart,
});

function Cart() {
  const { db } = useStore();
  const cart = useCart();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  useEffect(() => { setApplied(sessionStorage.getItem(PROMO_KEY)); }, []);
  const sub = cart.lines.reduce((s, l) => s + l.price * l.qty, 0);
  const promo = applied ? validatePromo(applied, db.promos, sub, today()).promo : undefined;
  const t = cartTotals(cart.lines, promo, db.settings);
  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const r = validatePromo(code, db.promos, sub, today());
    if (r.error) return toast.error(r.error);
    sessionStorage.setItem(PROMO_KEY, r.promo!.code);
    setApplied(r.promo!.code); setCode("");
    toast.success(`${r.promo!.code} applied`);
  };
  const remove = () => { sessionStorage.removeItem(PROMO_KEY); setApplied(null); };

  if (cart.lines.length === 0)
    return (
      <>
        <PageHeading title="Your Bag" />
        <div className="py-16 text-center">
          <p className="font-serif text-2xl">Your bag is empty</p>
          <Link to="/shop" className="caps mt-6 inline-block bg-primary px-8 py-3 text-xs text-primary-foreground">Continue shopping</Link>
        </div>
      </>
    );
  return (
    <>
      <PageHeading title="Your Bag" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border border-y border-border">
          {cart.lines.map((l) => (
            <li key={l.productId} className="grid grid-cols-[80px_minmax(0,1fr)_auto] gap-4 py-5 sm:grid-cols-[110px_minmax(0,1fr)_auto]">
              <Link to="/product/$slug" params={{ slug: l.product.slug }} className="tile-frame"><img src={l.product.images[0]} alt="" className="aspect-square w-full object-cover" /></Link>
              <div className="min-w-0">
                <Link to="/product/$slug" params={{ slug: l.product.slug }} className="font-serif text-lg hover:text-gold">{l.product.name}</Link>
                <p className="text-sm text-muted-foreground">{gbp(l.price)} · {l.product.colour}</p>
                <div className="mt-3 inline-flex items-center border border-input bg-card">
                  <button onClick={() => cart.setQty(l.productId, l.qty - 1)} className="p-2" aria-label="Decrease quantity"><Minus className="h-3 w-3" /></button>
                  <span className="w-8 text-center text-sm">{l.qty}</span>
                  <button onClick={() => l.qty < l.product.stock ? cart.setQty(l.productId, l.qty + 1) : toast.error(`Only ${l.product.stock} in stock`)} className="p-2" aria-label="Increase quantity"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button onClick={() => { cart.setQty(l.productId, 0); toast("Removed from bag"); }} aria-label={`Remove ${l.product.name}`} className="p-1 hover:text-destructive"><X className="h-4 w-4" /></button>
                <p className="font-serif text-lg font-semibold">{gbp(l.price * l.qty)}</p>
              </div>
            </li>
          ))}
        </ul>
        <aside className="h-fit border border-border bg-card p-6">
          <h2 className="text-2xl">Summary</h2>
          <form onSubmit={apply} className="mt-4 flex gap-2">
            <label htmlFor="promo" className="sr-only">Promo code</label>
            <input id="promo" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code (try HERITAGE10)" className="min-w-0 flex-1 border border-input bg-background px-3 py-2 text-sm" />
            <button className="caps border border-foreground px-3 text-xs">Apply</button>
          </form>
          {promo && <p className="mt-2 flex justify-between text-sm text-accent">{promo.code} applied <button onClick={remove} className="underline">Remove</button></p>}
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{gbp(t.subtotal)}</dd></div>
            {t.discount > 0 && <div className="flex justify-between text-accent"><dt>Discount</dt><dd>−{gbp(t.discount)}</dd></div>}
            <div className="flex justify-between"><dt>UK standard delivery</dt><dd>{t.shipping === 0 ? "Free" : gbp(t.shipping)}</dd></div>
            {t.shipping > 0 && <p className="text-xs text-muted-foreground">Spend {gbp(db.settings.freeOver - (t.subtotal - t.discount))} more for free delivery.</p>}
            <div className="flex justify-between border-t border-border pt-3 font-serif text-xl font-semibold"><dt>Total</dt><dd>{gbp(t.total)}</dd></div>
          </dl>
          <Link to="/checkout" className="caps mt-6 block bg-primary py-3.5 text-center text-xs text-primary-foreground hover:bg-primary/90">Checkout</Link>
          <p className="mt-3 text-center text-xs text-muted-foreground">Demo store — no real payment is taken.</p>
        </aside>
      </div>
    </>
  );
}
