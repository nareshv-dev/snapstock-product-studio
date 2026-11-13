import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeading } from "@/components/site/ornaments";
import { gbp } from "@/lib/catalog";
import { cartTotals, useCart, useSession, useStore, validatePromo, type Order } from "@/lib/store";
import { PROMO_KEY, today } from "@/lib/checkout";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: seo("Checkout", "Secure demo checkout for Gray & Gable London.") }),
  component: Checkout,
});

const COUNTRIES = ["United Kingdom", "Ireland", "France", "Germany", "Netherlands", "Belgium", "Spain", "Italy"];
const ukPostcode = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  name: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z.string().trim().max(30).optional(),
  line1: z.string().trim().min(3, "Enter your address").max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2, "Enter your town or city").max(80),
  postcode: z.string().trim().min(3, "Enter your postcode").max(12),
  country: z.string(),
  cardName: z.string().trim().min(2, "Enter the name on the card").max(100),
  cardNumber: z.string().transform((s) => s.replace(/\s/g, "")).refine((s) => /^\d{16}$/.test(s), "Card number must be 16 digits"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY").refine((s) => {
    const [m, y] = s.split("/").map(Number);
    return new Date(2000 + y, m, 1) > new Date();
  }, "Card has expired"),
  cvc: z.string().regex(/^\d{3,4}$/, "3 or 4 digits"),
}).refine((d) => d.country !== "United Kingdom" || ukPostcode.test(d.postcode), { path: ["postcode"], message: "Enter a valid UK postcode" });

type Form = Record<string, string>;

function Checkout() {
  const { db, set, log, hydrated } = useStore();
  const cart = useCart();
  const user = useSession();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [f, setF] = useState<Form>({ email: "", name: "", phone: "", line1: "", line2: "", city: "", postcode: "", country: "United Kingdom", cardName: "", cardNumber: "", expiry: "", cvc: "" });
  useEffect(() => { setPromoCode(sessionStorage.getItem(PROMO_KEY)); }, []);
  useEffect(() => {
    if (!user) return;
    const a = user.addresses[0];
    setF((s) => ({ ...s, email: user.email, name: user.name, phone: user.phone ?? "", ...(a ? { line1: a.line1, line2: a.line2 ?? "", city: a.city, postcode: a.postcode, country: a.country } : {}) }));
  }, [user?.id]);

  const sub = cart.lines.reduce((s, l) => s + l.price * l.qty, 0);
  const promo = promoCode ? validatePromo(promoCode, db.promos, sub, today()).promo : undefined;
  const eu = f.country !== "United Kingdom";
  const t = cartTotals(cart.lines, promo, db.settings, eu ? "express" : delivery);

  if (hydrated && !user)
    return (
      <div className="mx-auto max-w-md py-28 text-center">
        <Lock className="mx-auto h-8 w-8 text-gold" strokeWidth={1.3} />
        <h1 className="mt-4 text-4xl">Sign in to checkout</h1>
        <p className="mt-3 text-muted-foreground">Please sign in or create an account to complete your purchase. Your bag is saved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/login" search={{ redirect: "/checkout" }} className="caps bg-primary px-8 py-3 text-xs text-primary-foreground hover:bg-primary/90">Sign in</Link>
          <Link to="/signup" search={{ redirect: "/checkout" }} className="caps border border-foreground/40 px-8 py-3 text-xs hover:border-gold hover:text-gold">Create account</Link>
        </div>
      </div>
    );
  if (cart.lines.length === 0)
    return <div className="py-32 text-center"><h1 className="text-4xl">Your bag is empty</h1><Link to="/shop" className="caps mt-4 inline-block text-xs underline">Continue shopping</Link></div>;

  const field = (k: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block text-sm">
      {label}
      <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `${k}-err` : undefined} className={`mt-1 w-full border bg-background px-3 py-2.5 ${errors[k] ? "border-destructive" : "border-input"}`} {...props} />
      {errors[k] && <span id={`${k}-err`} className="mt-1 block text-xs text-destructive">{errors[k]}</span>}
    </label>
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => { errs[String(i.path[0])] ??= i.message; });
      setErrors(errs);
      toast.error("Please check the highlighted fields.");
      return;
    }
    for (const l of cart.lines) if (l.qty > l.product.stock) return toast.error(`${l.product.name}: only ${l.product.stock} left.`);
    setErrors({});
    setBusy(true);
    setTimeout(() => {
      const d = r.data;
      const id = `GG-${10460 + db.orders.length + Math.floor(Math.random() * 90)}`;
      const order: Order = {
        id, userId: user?.id, email: d.email, name: d.name,
        items: cart.lines.map((l) => ({ productId: l.productId, name: l.product.name, price: l.price, qty: l.qty, image: l.product.images[0] })),
        subtotal: t.subtotal, discount: t.discount, promo: promo?.code, shipping: t.shipping, total: t.total,
        address: { name: d.name, line1: d.line1, line2: d.line2, city: d.city, postcode: d.postcode.toUpperCase(), country: d.country },
        delivery: eu ? "EU Tracked (4–7 days)" : delivery === "express" ? "Express Next Day" : "Royal Mail Tracked (2–3 days)",
        status: "paid", paymentStatus: "paid", tracking: "", notes: `Card ending ${d.cardNumber.slice(-4)} (simulated)`, createdAt: new Date().toISOString(),
      };
      set((s) => ({
        ...s, orders: [order, ...s.orders], cart: [],
        products: s.products.map((p) => { const l = order.items.find((i) => i.productId === p.id); return l ? { ...p, stock: Math.max(0, p.stock - l.qty) } : p; }),
        promos: s.promos.map((p) => (p.code === promo?.code ? { ...p, used: p.used + 1 } : p)),
      }));
      log(`New order ${id} from ${d.name} (${gbp(t.total)})`);
      sessionStorage.removeItem(PROMO_KEY);
      navigate({ to: "/order-success/$id", params: { id } });
    }, 1200);
  };

  return (
    <>
      <PageHeading title="Checkout"><span className="inline-flex items-center gap-2 text-sm"><Lock className="h-4 w-4" /> Demo checkout — do not enter real card details. Try 4242 4242 4242 4242.</span></PageHeading>
      <form onSubmit={submit} noValidate className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="text-2xl">Contact</h2>
            {!user && <p className="text-sm text-muted-foreground">Have an account? <Link to="/login" className="underline">Sign in</Link></p>}
            <div className="grid gap-4 sm:grid-cols-2">{field("email", "Email", { type: "email", autoComplete: "email" })}{field("phone", "Phone (optional)", { type: "tel", autoComplete: "tel" })}</div>
          </section>
          <section className="space-y-4">
            <h2 className="text-2xl">Delivery address</h2>
            {field("name", "Full name", { autoComplete: "name" })}
            {field("line1", "Address line 1", { autoComplete: "address-line1" })}
            {field("line2", "Address line 2 (optional)", { autoComplete: "address-line2" })}
            <div className="grid gap-4 sm:grid-cols-3">
              {field("city", "Town / City", { autoComplete: "address-level2" })}
              {field("postcode", "Postcode", { autoComplete: "postal-code" })}
              <label className="block text-sm">Country
                <select value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} className="mt-1 w-full border border-input bg-background px-3 py-2.5">
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl">Delivery method</h2>
            {eu ? (
              <p className="border border-gold bg-card p-4 text-sm">EU Tracked delivery, 4–7 working days — {gbp(db.settings.express)}. Duties prepaid.</p>
            ) : (
              ([["standard", "Royal Mail Tracked", "2–3 working days", t.subtotal - t.discount >= db.settings.freeOver ? "Free" : gbp(db.settings.standard)], ["express", "Express Next Day", "Order by 2pm", gbp(db.settings.express)]] as const).map(([v, n, d, price]) => (
                <label key={v} className={`flex cursor-pointer items-center justify-between border p-4 text-sm ${delivery === v ? "border-gold bg-card" : "border-input"}`}>
                  <span className="flex items-center gap-3"><input type="radio" name="delivery" checked={delivery === v} onChange={() => setDelivery(v)} className="accent-[var(--gold)]" /><span><strong className="font-semibold">{n}</strong><br /><span className="text-muted-foreground">{d}</span></span></span>
                  <span>{price}</span>
                </label>
              ))
            )}
          </section>
          <section className="space-y-4">
            <h2 className="text-2xl">Payment <span className="caps ml-2 bg-muted px-2 py-1 align-middle text-[0.6rem]">Simulated</span></h2>
            {field("cardName", "Name on card", { autoComplete: "off" })}
            {field("cardNumber", "Card number", { inputMode: "numeric", placeholder: "4242 4242 4242 4242", autoComplete: "off", maxLength: 19 })}
            <div className="grid grid-cols-2 gap-4">{field("expiry", "Expiry (MM/YY)", { placeholder: "08/29", autoComplete: "off", maxLength: 5 })}{field("cvc", "CVC", { inputMode: "numeric", autoComplete: "off", maxLength: 4 })}</div>
          </section>
        </div>
        <aside className="h-fit border border-border bg-card p-6 lg:sticky lg:top-32">
          <h2 className="text-2xl">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {cart.lines.map((l) => (
              <li key={l.productId} className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 text-sm">
                <img src={l.product.images[0]} alt="" className="aspect-square w-14 object-cover" />
                <span className="min-w-0 truncate">{l.product.name} × {l.qty}</span>
                <span>{gbp(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{gbp(t.subtotal)}</dd></div>
            {t.discount > 0 && <div className="flex justify-between text-accent"><dt>Discount ({promo?.code})</dt><dd>−{gbp(t.discount)}</dd></div>}
            <div className="flex justify-between"><dt>Delivery</dt><dd>{t.shipping === 0 ? "Free" : gbp(t.shipping)}</dd></div>
            <div className="flex justify-between border-t border-border pt-3 font-serif text-xl font-semibold"><dt>Total</dt><dd>{gbp(t.total)}</dd></div>
          </dl>
          <button disabled={busy} className="caps mt-6 w-full bg-primary py-3.5 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{busy ? "Processing payment…" : `Pay ${gbp(t.total)}`}</button>
        </aside>
      </form>
    </>
  );
}
