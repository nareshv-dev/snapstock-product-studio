import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Download, Eye, Plus, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminTitle, Confirm, btn, btnGhost, downloadCSV, inputCls, td, th } from "@/components/admin/ui";
import { CATEGORIES, gbp, type Product, type Status } from "@/lib/catalog";
import { uid, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/products")({ component: Products });

function Products() {
  const { db, set, log } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState<"" | Status>("");
  const [sort, setSort] = useState<"name" | "price" | "stock">("name");
  const [sel, setSel] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const per = 10;
  const list = useMemo(() => db.products
    .filter((p) => (!q || `${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase())) && (!cat || p.category === cat) && (!status || p.status === status))
    .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : sort === "price" ? a.price - b.price : a.stock - b.stock)), [db.products, q, cat, status, sort]);
  const pageItems = list.slice(page * per, page * per + per);
  const upd = (ids: string[], fn: (p: Product) => Product | null, msg: string) => {
    set((d) => ({ ...d, products: d.products.map((p) => (ids.includes(p.id) ? fn(p) : p)).filter(Boolean) as Product[] }));
    log(msg); toast.success(msg); setSel([]);
  };
  const duplicate = (p: Product) => {
    const id = uid("p");
    set((d) => ({ ...d, products: [...d.products, { ...p, id, slug: `${p.slug}-copy-${id.slice(-4)}`, name: `${p.name} (copy)`, sku: `${p.sku}-C`, status: "draft" }] }));
    log(`Duplicated ${p.name}`); toast.success("Duplicated as draft");
  };
  const importCSV = () => {
    const id = uid("p");
    const base = db.products[0];
    set((d) => ({ ...d, products: [...d.products, { ...base, id, slug: `imported-bag-${id.slice(-4)}`, name: "Imported Heritage Tote", sku: `GG-IMP-${id.slice(-4).toUpperCase()}`, status: "draft", featured: false }] }));
    log("CSV import simulated (1 product)"); toast.success("Simulated import: 1 draft product added");
  };
  return (
    <>
      <AdminTitle title="Products" sub={`${db.products.length} products`}>
        <button className={btnGhost} onClick={importCSV}><Upload className="h-3 w-3" /> Import CSV</button>
        <button className={btnGhost} onClick={() => downloadCSV("products.csv", [["SKU", "Name", "Category", "Price", "Sale", "Stock", "Status"], ...db.products.map((p) => [p.sku, p.name, p.category, p.price, p.salePrice ?? "", p.stock, p.status])])}><Download className="h-3 w-3" /> Export</button>
        <Link to="/admin/products/$id" params={{ id: "new" }} className={btn}><Plus className="h-3 w-3" /> Add product</Link>
      </AdminTitle>
      <div className="mb-4 grid gap-2 sm:grid-cols-4">
        <input aria-label="Search products" placeholder="Search name or SKU" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} className={inputCls + " mt-0"} />
        <select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)} className={inputCls + " mt-0"}><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as Status)} className={inputCls + " mt-0"}><option value="">All statuses</option><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select>
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={inputCls + " mt-0"}><option value="name">Sort: name</option><option value="price">Sort: price</option><option value="stock">Sort: stock</option></select>
      </div>
      {sel.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 border border-gold bg-card p-2 text-sm">
          <span className="px-2">{sel.length} selected</span>
          <button className={btnGhost} onClick={() => upd(sel, (p) => ({ ...p, status: "active" }), `Activated ${sel.length} products`)}>Activate</button>
          <button className={btnGhost} onClick={() => upd(sel, (p) => ({ ...p, status: "archived" }), `Archived ${sel.length} products`)}>Archive</button>
          <button className={btnGhost} onClick={() => { const pct = Number(prompt("Set sale discount % for selected (0 to clear)", "10")); if (!isNaN(pct)) upd(sel, (p) => ({ ...p, salePrice: pct > 0 ? +(p.price * (1 - pct / 100)).toFixed(2) : undefined }), `Bulk price edit on ${sel.length} products`); }}>Bulk sale %</button>
          <Confirm trigger={<button className={btnGhost + " text-destructive"}>Delete</button>} title={`Delete ${sel.length} products?`} description="This removes them from the demo store." onConfirm={() => upd(sel, () => null, `Deleted ${sel.length} products`)} />
        </div>
      )}
      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border"><tr>
            <th className={th}><input type="checkbox" aria-label="Select all" checked={pageItems.length > 0 && pageItems.every((p) => sel.includes(p.id))} onChange={(e) => setSel(e.target.checked ? pageItems.map((p) => p.id) : [])} /></th>
            <th className={th}>Product</th><th className={th}>SKU</th><th className={th}>Price</th><th className={th}>Stock</th><th className={th}>Status</th><th className={th}>Flags</th><th className={th}></th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {pageItems.map((p) => (
              <tr key={p.id} className="hover:bg-muted/40">
                <td className={td}><input type="checkbox" aria-label={`Select ${p.name}`} checked={sel.includes(p.id)} onChange={() => setSel((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))} /></td>
                <td className={td}><Link to="/admin/products/$id" params={{ id: p.id }} className="flex items-center gap-3 hover:text-gold"><img src={p.images[0]} alt="" className="h-10 w-10 shrink-0 object-cover" /><span className="min-w-40">{p.name}</span></Link></td>
                <td className={td + " text-muted-foreground"}>{p.sku}</td>
                <td className={td}>{p.salePrice ? <><s className="text-muted-foreground">{gbp(p.price)}</s> {gbp(p.salePrice)}</> : gbp(p.price)}</td>
                <td className={td + (p.stock === 0 ? " text-destructive" : p.stock <= db.settings.lowStock ? " text-accent" : "")}>{p.stock}</td>
                <td className={td}><span className="caps text-[0.6rem]">{p.status}</span></td>
                <td className={td + " whitespace-nowrap text-xs text-muted-foreground"}>{[p.featured && "Featured", p.isNew && "New", p.bestSeller && "Best"].filter(Boolean).join(" · ")}</td>
                <td className={td}>
                  <div className="flex gap-1">
                    <Link to="/product/$slug" params={{ slug: p.slug }} target="_blank" className="p-1.5 hover:text-gold" aria-label="Preview"><Eye className="h-4 w-4" /></Link>
                    <button onClick={() => duplicate(p)} className="p-1.5 hover:text-gold" aria-label="Duplicate"><Copy className="h-4 w-4" /></button>
                    {p.status === "archived"
                      ? <button onClick={() => upd([p.id], (x) => ({ ...x, status: "active" }), `Restored ${p.name}`)} className="caps text-[0.6rem] underline">Restore</button>
                      : <button onClick={() => upd([p.id], (x) => ({ ...x, status: "archived" }), `Archived ${p.name}`)} className="caps text-[0.6rem] underline">Archive</button>}
                  </div>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-muted-foreground">No products found.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2 text-sm">
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className={btnGhost}>Prev</button>
        <span>Page {page + 1} of {Math.max(1, Math.ceil(list.length / per))}</span>
        <button disabled={(page + 1) * per >= list.length} onClick={() => setPage((p) => p + 1)} className={btnGhost}>Next</button>
      </div>
    </>
  );
}
