import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeading } from "@/components/site/ornaments";
import { StatusPill } from "@/components/site/order-status";
import { gbp } from "@/lib/catalog";
import { uid, useSession, useStore, type Address } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/account/")({
  head: () => ({ meta: seo("My Account", "Your Gray & Gable account, orders and saved addresses.") }),
  component: Account,
});

const empty = { label: "Home", name: "", line1: "", line2: "", city: "", postcode: "", country: "United Kingdom" };

function Account() {
  const { db, set, hydrated } = useStore();
  const user = useSession();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview" | "orders" | "addresses">("overview");
  const [form, setForm] = useState<typeof empty | null>(null);
  if (!hydrated) return <div className="py-32" />;
  if (!user)
    return (
      <div className="py-32 text-center">
        <h1 className="text-4xl">Please sign in</h1>
        <Link to="/login" className="caps mt-6 inline-block bg-primary px-8 py-3 text-xs text-primary-foreground">Sign in</Link>
      </div>
    );
  const orders = db.orders.filter((o) => o.userId === user.id);
  const spent = orders.filter((o) => o.status !== "cancelled" && o.status !== "refunded").reduce((s, o) => s + o.total, 0);
  const saveAddr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || form.name.trim().length < 2 || form.line1.trim().length < 3 || form.city.trim().length < 2 || form.postcode.trim().length < 3) return toast.error("Please complete the address.");
    const a: Address = { id: uid("a"), ...form };
    set((d) => ({ ...d, users: d.users.map((u) => (u.id === user.id ? { ...u, addresses: [...u.addresses, a] } : u)) }));
    setForm(null);
    toast.success("Address saved");
  };
  const removeAddr = (id: string) => set((d) => ({ ...d, users: d.users.map((u) => (u.id === user.id ? { ...u, addresses: u.addresses.filter((a) => a.id !== id) } : u)) }));
  const signOut = () => { set((d) => ({ ...d, sessionUserId: null })); toast("Signed out"); navigate({ to: "/" }); };

  return (
    <>
      <PageHeading eyebrow="My account" title={`Hello, ${user.name.split(" ")[0]}`} />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 flex flex-wrap gap-2 border-b border-border" role="tablist">
          {(["overview", "orders", "addresses"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`caps -mb-px border-b-2 px-4 py-3 text-xs ${tab === t ? "border-gold text-foreground" : "border-transparent text-muted-foreground"}`}>{t}</button>
          ))}
          <button onClick={signOut} className="caps ml-auto px-4 py-3 text-xs text-muted-foreground hover:text-destructive">Sign out</button>
        </div>

        {tab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-3">
            {[["Orders", String(orders.length)], ["Total spent", gbp(spent)], ["Wishlist", String(db.wishlist.length)]].map(([k, v]) => (
              <div key={k} className="border border-border bg-card p-6 text-center"><p className="caps text-xs text-muted-foreground">{k}</p><p className="mt-2 font-serif text-3xl">{v}</p></div>
            ))}
            <div className="border border-border bg-card p-6 sm:col-span-3">
              <h2 className="text-2xl">Details</h2>
              <p className="mt-2 text-sm">{user.name} · {user.email}{user.phone ? ` · ${user.phone}` : ""}</p>
              <p className="mt-1 text-xs text-muted-foreground">Member since {user.createdAt} · Demo account stored in this browser</p>
            </div>
          </div>
        )}

        {tab === "orders" && (orders.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">No orders yet. <Link to="/shop" className="underline">Start shopping</Link></p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {orders.map((o) => (
              <li key={o.id}>
                <Link to="/account/orders/$id" params={{ id: o.id }} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4 hover:bg-card/60 sm:grid-cols-4">
                  <span className="font-serif text-lg">{o.id}</span>
                  <span className="hidden text-sm text-muted-foreground sm:block">{new Date(o.createdAt).toLocaleDateString("en-GB")}</span>
                  <span className="hidden sm:block"><StatusPill s={o.status} /></span>
                  <span className="text-right font-semibold">{gbp(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ))}

        {tab === "addresses" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {user.addresses.map((a) => (
              <div key={a.id} className="border border-border bg-card p-5 text-sm">
                <p className="caps text-xs font-semibold">{a.label}</p>
                <p className="mt-2">{a.name}<br />{a.line1}{a.line2 ? <><br />{a.line2}</> : null}<br />{a.city} {a.postcode}<br />{a.country}</p>
                <button onClick={() => removeAddr(a.id)} className="mt-3 text-xs underline hover:text-destructive">Remove</button>
              </div>
            ))}
            {form ? (
              <form onSubmit={saveAddr} className="space-y-2 border border-gold bg-card p-5 text-sm sm:col-span-2">
                {(["label", "name", "line1", "line2", "city", "postcode", "country"] as const).map((k) => (
                  <label key={k} className="block capitalize">{k === "line1" ? "Address line 1" : k === "line2" ? "Address line 2" : k}
                    <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} maxLength={120} className="mt-1 w-full border border-input bg-background px-3 py-2" />
                  </label>
                ))}
                <div className="flex gap-2 pt-2"><button className="caps bg-primary px-5 py-2 text-xs text-primary-foreground">Save</button><button type="button" onClick={() => setForm(null)} className="caps px-5 py-2 text-xs">Cancel</button></div>
              </form>
            ) : (
              <button onClick={() => setForm({ ...empty, name: user.name })} className="caps border border-dashed border-border p-8 text-xs hover:border-gold">+ Add address</button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
