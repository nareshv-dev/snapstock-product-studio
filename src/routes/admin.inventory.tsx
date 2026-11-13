import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminTitle, Panel, Stat, btn, inputCls, td, th } from "@/components/admin/ui";
import { gbp } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/inventory")({ component: Inventory });

function Inventory() {
  const { db, set, log } = useStore();
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [adj, setAdj] = useState<Record<string, string>>({});
  const [reason, setReason] = useState("Stock count");
  const reserved = (id: string) => db.orders.filter((o) => o.status === "paid" || o.status === "processing").reduce((s, o) => s + (o.items.find((i) => i.productId === id)?.qty ?? 0), 0);
  const list = db.products.filter((p) => filter === "all" || (filter === "out" ? p.stock === 0 : p.stock > 0 && p.stock <= db.settings.lowStock));
  const apply = () => {
    const changes = Object.entries(adj).filter(([, v]) => v !== "" && !isNaN(+v) && +v !== 0);
    if (!changes.length) return toast.error("Enter an adjustment (e.g. +5 or -2).");
    set((d) => ({ ...d, products: d.products.map((p) => { const c = changes.find(([id]) => id === p.id); return c ? { ...p, stock: Math.max(0, p.stock + Math.round(+c[1])) } : p; }) }));
    changes.forEach(([id, v]) => log(`Stock ${+v > 0 ? "+" : ""}${v} for ${db.products.find((p) => p.id === id)?.name} (${reason})`));
    setAdj({}); toast.success(`${changes.length} stock adjustments recorded`);
  };
  return (
    <>
      <AdminTitle title="Inventory" sub="Adjust stock with a reason; reserved = in unfulfilled orders" />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Units in stock" value={String(db.products.reduce((s, p) => s + p.stock, 0))} />
        <Stat label="Stock value (cost)" value={gbp(db.products.reduce((s, p) => s + p.stock * p.cost, 0))} />
        <Stat label="Low stock" value={String(db.products.filter((p) => p.stock > 0 && p.stock <= db.settings.lowStock).length)} />
        <Stat label="Out of stock" value={String(db.products.filter((p) => p.stock === 0).length)} />
      </div>
      <Panel>
        <div className="mb-3 flex flex-wrap items-end gap-2">
          {(["all", "low", "out"] as const).map((f) => <button key={f} onClick={() => setFilter(f)} className={`caps border px-3 py-1.5 text-[0.6rem] ${filter === f ? "border-gold bg-muted" : "border-border"}`}>{f === "all" ? "All" : f === "low" ? "Low stock" : "Out of stock"}</button>)}
          <label className="ml-auto text-sm">Reason<select value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls}><option>Stock count</option><option>New delivery</option><option>Damaged</option><option>Returned</option></select></label>
          <label className="text-sm">Low-stock threshold<input type="number" min={0} value={db.settings.lowStock} onChange={(e) => set((d) => ({ ...d, settings: { ...d.settings, lowStock: Math.max(0, +e.target.value) } }))} className={inputCls + " w-24"} /></label>
          <button onClick={apply} className={btn}>Apply adjustments</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border"><tr><th className={th}>Product</th><th className={th}>SKU</th><th className={th}>On hand</th><th className={th}>Reserved</th><th className={th}>Adjust (+/−)</th><th className={th}>Set to</th></tr></thead>
            <tbody className="divide-y divide-border">
              {list.map((p) => (
                <tr key={p.id}>
                  <td className={td}>{p.name}</td><td className={td + " text-muted-foreground"}>{p.sku}</td>
                  <td className={td + (p.stock === 0 ? " text-destructive" : p.stock <= db.settings.lowStock ? " text-accent" : "")}>{p.stock}</td>
                  <td className={td}>{reserved(p.id)}</td>
                  <td className={td}><input aria-label={`Adjust ${p.name}`} value={adj[p.id] ?? ""} onChange={(e) => setAdj({ ...adj, [p.id]: e.target.value })} placeholder="0" className="w-20 border border-input bg-background px-2 py-1" /></td>
                  <td className={td}><input aria-label={`Set stock for ${p.name}`} type="number" min={0} defaultValue={p.stock} key={p.stock} onBlur={(e) => { const v = Math.max(0, Math.floor(+e.target.value)); if (v !== p.stock) { set((d) => ({ ...d, products: d.products.map((x) => (x.id === p.id ? { ...x, stock: v } : x)) })); log(`Stock set to ${v} for ${p.name} (${reason})`); } }} className="w-20 border border-input bg-background px-2 py-1" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
