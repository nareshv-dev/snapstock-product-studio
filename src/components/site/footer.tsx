import { Link, linkOptions, type LinkProps } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import skyline from "@/assets/london-skyline.png";
import { useStore } from "@/lib/store";
import { FleurRule } from "./ornaments";

export function Footer() {
  const { db, set } = useStore();
  const [email, setEmail] = useState("");
  const sub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Please enter a valid email address.");
    set((d) => ({ ...d, newsletter: Array.from(new Set([...d.newsletter, email.toLowerCase()])) }));
    setEmail("");
    toast.success("Welcome to our letters from the studio.");
  };
  const col = (title: string, items: [LinkProps, string][]) => (
    <div>
      <h3 className="caps text-xs font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map(([lo, l]) => <li key={l}><Link {...lo} className="hover:text-gold">{l}</Link></li>)}
      </ul>
    </div>
  );
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-border bg-card">
      <section className="mx-auto max-w-3xl px-4 py-14 text-center">
        <p className="caps text-xs text-muted-foreground">The Gray &amp; Gable Letter</p>
        <h2 className="mt-2 text-3xl sm:text-4xl">Join our circle</h2>
        <FleurRule className="mt-3" />
        <p className="mt-3 text-muted-foreground">{db.content.newsletter}</p>
        <form onSubmit={sub} className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
          <label htmlFor="nl" className="sr-only">Email address</label>
          <input id="nl" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" className="flex-1 border border-input bg-background px-3 py-2.5 text-sm" />
          <button className="caps bg-primary px-6 py-2.5 text-xs text-primary-foreground hover:bg-primary/90">Subscribe</button>
        </form>
      </section>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 pb-8 sm:grid-cols-4">
        {col("Shop", [[linkOptions({ to: "/shop" }), "All bags"], [linkOptions({ to: "/collections" }), "Collections"], [linkOptions({ to: "/collections/$slug", params: { slug: "new-arrivals" } }), "New arrivals"], [linkOptions({ to: "/collections/$slug", params: { slug: "gifts-under-30" } }), "Gifts under £30"]])}
        {col("Help", [[linkOptions({ to: "/contact" }), "Contact us"], [linkOptions({ to: "/faq" }), "FAQ"], [linkOptions({ to: "/shipping-returns" }), "Shipping & returns"], [linkOptions({ to: "/account" }), "My account"]])}
        {col("House", [[linkOptions({ to: "/about" }), "Our story"], [linkOptions({ to: "/privacy" }), "Privacy"], [linkOptions({ to: "/terms" }), "Terms"], [linkOptions({ to: "/admin" }), "Admin (demo)"]])}
        <div>
          <h3 className="caps text-xs font-semibold">Studio</h3>
          <p className="mt-3 text-sm text-muted-foreground">12 Marylebone Lane<br />London W1U 2NE<br />hello@grayandgable.co.uk</p>
        </div>
      </div>
      <img src={skyline} alt="" aria-hidden loading="lazy" width={1600} height={608} className="mx-auto -mb-2 w-full max-w-5xl opacity-50" />
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        © 2026 Gray &amp; Gable London · Demonstration store: products, orders and payments are simulated.
      </div>
    </footer>
  );
}
