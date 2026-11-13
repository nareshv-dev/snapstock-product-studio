import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminTitle, Confirm, Panel, btn, btnGhost, inputCls } from "@/components/admin/ui";
import { CATEGORIES, type Collection } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/collections")({ component: Collections });

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function Collections() {
  const { db, set, log } = useStore();
  const [edit, setEdit] = useState<Collection | null>(null);
  const [isNew, setIsNew] = useState(false);
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit || edit.name.trim().length < 2) return toast.error("Name is required.");
    const c = { ...edit, slug: edit.slug || slugify(edit.name) };
    if (isNew && db.collections.some((x) => x.slug === c.slug)) return toast.error("Slug already in use.");
    set((d) => ({ ...d, collections: isNew ? [...d.collections, c] : d.collections.map((x) => (x.slug === c.slug ? c : x)) }));
    log(`${isNew ? "Created" : "Updated"} collection ${c.name}`); toast.success("Collection saved"); setEdit(null);
  };
  const move = (i: number, dir: -1 | 1) => set((d) => { const a = [...d.collections]; const j = i + dir; if (j < 0 || j >= a.length) return d; [a[i], a[j]] = [a[j], a[i]]; return { ...d, collections: a }; });
  const count = (slug: string) => db.products.filter((p) => p.collections.includes(slug)).length;
  return (
    <>
      <AdminTitle title="Collections & categories" sub="Drag order with arrows; featured collections show on the home page">
        <button className={btn} onClick={() => { setIsNew(true); setEdit({ slug: "", name: "", description: "", image: db.products[0]?.images[0] ?? "", visible: true, featured: false }); }}><Plus className="h-3 w-3" /> New collection</button>
      </AdminTitle>
      {edit && (
        <Panel title={isNew ? "New collection" : `Edit ${edit.name}`} className="mb-4">
          <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Name<input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={inputCls} /></label>
            <label className="text-sm">Cover image
              <select value={edit.image} onChange={(e) => setEdit({ ...edit, image: e.target.value })} className={inputCls}>{db.products.map((p) => <option key={p.id} value={p.images[0]}>{p.name}</option>)}</select>
            </label>
            <label className="text-sm sm:col-span-2">Description<input value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} className={inputCls} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.visible} onChange={(e) => setEdit({ ...edit, visible: e.target.checked })} /> Visible</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.featured} onChange={(e) => setEdit({ ...edit, featured: e.target.checked })} /> Feature on home page</label>
            <div className="flex gap-2 sm:col-span-2"><button className={btn}>Save</button><button type="button" className={btnGhost} onClick={() => setEdit(null)}>Cancel</button></div>
          </form>
        </Panel>
      )}
      <div className="space-y-2">
        {db.collections.map((c, i) => (
          <div key={c.slug} className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 border border-border bg-card p-3">
            <img src={c.image} alt="" className="h-12 w-12 object-cover" />
            <div className="min-w-0"><p className="truncate font-serif text-lg">{c.name}</p><p className="text-xs text-muted-foreground">{count(c.slug)} products · {c.visible ? "Visible" : "Hidden"}{c.featured ? " · Featured" : ""}</p></div>
            <div className="flex items-center gap-1">
              <button onClick={() => move(i, -1)} aria-label="Move up" className="p-1.5"><ArrowUp className="h-4 w-4" /></button>
              <button onClick={() => move(i, 1)} aria-label="Move down" className="p-1.5"><ArrowDown className="h-4 w-4" /></button>
              <button className={btnGhost} onClick={() => { setIsNew(false); setEdit(c); }}>Edit</button>
              <Confirm trigger={<button className={btnGhost + " text-destructive"}>Delete</button>} title={`Delete ${c.name}?`} description="Products stay, but are removed from this collection."
                onConfirm={() => { set((d) => ({ ...d, collections: d.collections.filter((x) => x.slug !== c.slug), products: d.products.map((p) => ({ ...p, collections: p.collections.filter((s) => s !== c.slug) })) })); log(`Deleted collection ${c.name}`); }} />
            </div>
          </div>
        ))}
      </div>
      <Panel title="Categories" className="mt-6">
        <p className="mb-2 text-sm text-muted-foreground">Store categories (fixed in the demo) with nested collections shown on each product.</p>
        <ul className="grid gap-2 sm:grid-cols-4">{CATEGORIES.map((c) => <li key={c.slug} className="border border-border p-3 text-sm">{c.name}<br /><span className="text-xs text-muted-foreground">{db.products.filter((p) => p.category === c.slug).length} products</span></li>)}</ul>
      </Panel>
    </>
  );
}
