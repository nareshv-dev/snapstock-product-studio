import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminTitle, Panel, btn, btnGhost, inputCls } from "@/components/admin/ui";
import { useStore, type Content } from "@/lib/store";

export const Route = createFileRoute("/admin/content")({ component: ContentPage });

function ContentPage() {
  const { db, set, log } = useStore();
  const [c, setC] = useState<Content>(db.content);
  const fields: [keyof Content, string][] = [
    ["announcement", "Announcement bar"], ["heroTagline", "Hero tagline (left)"], ["heroRight", "Hero right lines (separate with |)"],
    ["heroCta", "Hero button text"], ["brandPanel", "Brand panel line"], ["newsletter", "Newsletter text"],
  ];
  const toggleFeatured = (id: string) => set((d) => ({ ...d, products: d.products.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)) }));
  return (
    <>
      <AdminTitle title="Storefront content" sub="Changes apply to the demo storefront when you publish them">
        <Link to="/" target="_blank" className={btnGhost}>Open storefront</Link>
      </AdminTitle>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Home page & global text">
          <div className="space-y-3">
            {fields.map(([k, l]) => <label key={k} className="block text-sm">{l}<input value={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.value })} maxLength={200} className={inputCls} /></label>)}
            <div className="flex gap-2"><button className={btn} onClick={() => { set((d) => ({ ...d, content: c })); log("Storefront content updated"); toast.success("Published to storefront"); }}>Publish changes</button><button className={btnGhost} onClick={() => setC(db.content)}>Discard</button></div>
          </div>
        </Panel>
        <Panel title="Preview">
          <div className="parchment border border-border">
            <div className="bg-primary px-3 py-1.5 text-center text-[0.6rem] tracking-widest text-primary-foreground">{c.announcement}</div>
            <div className="grid grid-cols-3 items-center gap-2 p-6 text-center">
              <p className="caps text-[0.65rem]">{c.heroTagline}</p>
              <div className="plaque mx-auto flex h-14 w-14 items-center justify-center"><span className="gold-text font-serif text-3xl">GG</span></div>
              <div>{c.heroRight.split("|").map((r) => <p key={r} className="caps text-[0.6rem]">{r}</p>)}</div>
            </div>
            <div className="pb-5 text-center"><span className="caps bg-primary px-4 py-2 text-[0.6rem] text-primary-foreground">{c.heroCta}</span></div>
          </div>
        </Panel>
        <Panel title="Featured products (home mosaic)" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {db.products.filter((p) => p.status === "active").map((p) => (
              <button key={p.id} onClick={() => toggleFeatured(p.id)} aria-pressed={p.featured} className={`border p-1 text-left text-xs ${p.featured ? "border-gold ring-1 ring-gold" : "border-border opacity-60"}`}>
                <img src={p.images[0]} alt="" className="aspect-square w-full object-cover" /><span className="mt-1 block truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Pages" className="lg:col-span-2">
          <p className="text-sm text-muted-foreground">About, Contact, FAQ, Shipping &amp; Returns, Privacy and Terms are live. Featured collections are managed under Collections.</p>
        </Panel>
      </div>
    </>
  );
}
