import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { useCart, useStore, useWishlist } from "@/lib/store";
import { Plaque } from "./ornaments";

const nav = [
  { to: "/shop", label: "Shop All", search: {} },
] as const;

export function Header() {
  const { db, hydrated } = useStore();
  const cart = useCart();
  const wish = useWishlist();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const isHome = useLocation().pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 60);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const clear = isHome && !scrolled && !searchOpen;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setSearchOpen(false); setOpen(false);
    navigate({ to: "/search", search: { q: q.trim() } });
  };
  const links = (
    <>
      {nav.map((n) => (
        <Link key={n.label} to={n.to} search={n.search} onClick={() => setOpen(false)} className="caps text-xs transition hover:text-gold" activeOptions={{ includeSearch: true, exact: true }} activeProps={{ className: "text-gold" }}>
          {n.label}
        </Link>
      ))}
      <Link to="/collections" onClick={() => setOpen(false)} className="caps text-xs transition hover:text-gold" activeProps={{ className: "text-gold" }}>Collections</Link>
      <Link to="/about" onClick={() => setOpen(false)} className="caps text-xs transition hover:text-gold" activeProps={{ className: "text-gold" }}>Our Story</Link>
    </>
  );
  const badge = (n: number) => hydrated && n > 0 ? <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.6rem] font-bold text-accent-foreground">{n}</span> : null;
  return (
    <header className={`${isHome ? "fixed inset-x-0" : "sticky"} top-0 z-40 transition-colors duration-500`}>
      <div className={`${clear ? "hidden" : ""} bg-primary px-4 py-2 text-center text-[0.7rem] tracking-[0.15em] text-primary-foreground`}><span className="text-gold-soft">Offer: 10% off with code HERITAGE10</span> · {db.content.announcement.split(" · ")[0]}</div>
      <div className={`border-b transition-all duration-500 ${clear ? "border-transparent bg-transparent text-primary-foreground" : "border-border bg-card/95 text-foreground backdrop-blur"}`}>
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 lg:grid-cols-[auto_1fr_auto]">
          <div className="flex min-w-0 items-center gap-2">
            <button className="p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
            <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Gray & Gable London home">
              <Plaque size="sm" />
              <span className="hidden min-w-0 text-left sm:block">
                <span className="caps block truncate text-base font-semibold leading-none">Gray &amp; Gable</span>
                <span className={`caps block text-[0.55rem] tracking-[0.5em] ${clear ? "text-primary-foreground/80" : "text-muted-foreground"}`}>London</span>
              </span>
            </Link>
          </div>
          <nav className="hidden flex-nowrap items-center justify-center gap-x-4 whitespace-nowrap lg:flex xl:gap-x-6" aria-label="Main">{links}</nav>
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <button className="p-2" onClick={() => setSearchOpen((s) => !s)} aria-label="Search" aria-expanded={searchOpen}><Search className="h-5 w-5" /></button>
            <Link to="/wishlist" className="relative p-2" aria-label="Wishlist"><Heart className="h-5 w-5" />{badge(wish.ids.length)}</Link>
            <Link to={db.sessionUserId ? "/account" : "/login"} className="p-2" aria-label="Account"><User className="h-5 w-5" /></Link>
            <Link to="/cart" className="relative p-2" aria-label="Cart"><ShoppingBag className="h-5 w-5" />{badge(cart.count)}</Link>
          </div>
        </div>
        {searchOpen && (
          <form onSubmit={submit} className="mx-auto flex max-w-2xl gap-2 px-4 pb-3" role="search">
            <label htmlFor="site-search" className="sr-only">Search bags</label>
            <input id="site-search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search kantha, jute, clutch…" className="flex-1 border border-input bg-background px-3 py-2 text-sm" />
            <button className="caps bg-primary px-4 text-xs text-primary-foreground">Search</button>
          </form>
        )}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="parchment absolute left-0 top-0 flex h-full w-72 flex-col gap-5 p-6 shadow-xl">
            <button className="self-end p-1" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
            <form onSubmit={submit} role="search"><input aria-label="Search bags" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full border border-input bg-card px-3 py-2 text-sm" /></form>
            <nav className="flex flex-col gap-4" aria-label="Mobile">{links}
              <Link to="/contact" onClick={() => setOpen(false)} className="caps text-xs">Contact</Link>
              <Link to="/faq" onClick={() => setOpen(false)} className="caps text-xs">FAQ</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
