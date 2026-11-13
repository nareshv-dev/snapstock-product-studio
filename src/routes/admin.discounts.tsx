import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminTitle, Confirm, Panel, btn, btnGhost, inputCls, td, th } from "@/components/admin/ui";
import { gbp } from "@/lib/catalog";
import { useStore, type Promo } from "@/lib/store";

export const Route = createFileRoute("/admin/discounts")({ component: Discounts });

const blank: Promo = { code: "", type: "percent", value: 10, minOrder: 0, expires: "2027-12-31", limit: 0, used: 0, active: true };

function Discounts() {
  const { db, set, log } = useStore();
  const [edit, setEdit] = useState<Promo | null>(null);
  const [orig, setOrig] = useState<string | null>(null);
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    const code = edit.code.trim().toUpperCase();
    if (!/^[A-Z0-9]{3,20}$/.test(code)) return toast.error("Code must be 3–20 letters or numbers.");
    if (!(edit.value > 0) || (edit.type === "percent" && edit.value > 100)) return toast.error("Enter a valid discount value.");
    if (db.promos.some((p) => p.code === code && p.code !== orig)) return toast.error("That code already exists.");
    const p = { ...edit, code };
    set((d) => ({ ...d, promos: orig ? d.promos.map((x) => (x.code === orig ? p : x)) : [...d.promos, p] }));
    log(`${orig ? "Updated" : "Created"} promo ${code}`); toast.success("Promo saved"); setEdit(null);
  };
  const toggle = (p: Promo) => { set((d) => ({ ...d, promos: d.promos.map((x) => (x.code === p.code ? { ...x, active: !x.active } : x)) })); log(`${p.active ? "Disabled" : "Enabled"} ${p.code}`); };
  return (
    <>
      <AdminTitle title="Discounts & promotions" sub="Codes work immediately in the storefront cart">
        <button className={btn} onClick={() => { setOrig(null); setEdit(blank); }}><Plus className="h-3 w-3" /> New code</button>
      </AdminTitle>
      {edit && (
        <Panel title={orig ? `Edit ${orig}` : "New promo code"} className="mb-4">
          <form onSubmit={save} className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">Code<input value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value })} className={inputCls} /></label>
            <label className="text-sm">Type<select value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value as Promo["type"] })} className={inputCls}><option value="percent">Percentage</option><option value="fixed">Fixed amount (£)</option></select></label>
            <label className="text-sm">Value<input type="number" step="0.01" value={edit.value} onChange={(e) => setEdit({ ...edit, value: +e.target.value })} className={inputCls} /></label>
            <label className="text-sm">Minimum order (£)<input type="number" value={edit.minOrder} onChange={(e) => setEdit({ ...edit, minOrder: +e.target.value })} className={inputCls} /></label>
            <label className="text-sm">Expires<input type="date" value={edit.expires} onChange={(e) => setEdit({ ...edit, expires: e.target.value })} className={inputCls} /></label>
            <label className="text-sm">Usage limit (0 = unlimited)<input type="number" value={edit.limit} onChange={(e) => setEdit({ ...edit, limit: +e.target.value })} className={inputCls} /></label>
            <div className="flex gap-2 sm:col-span-3"><button className={btn}>Save</button><button type="button" className={btnGhost} onClick={() => setEdit(null)}>Cancel</button></div>
          </form>
        </Panel>
      )}
      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border"><tr><th className={th}>Code</th><th className={th}>Discount</th><th className={th}>Min order</th><th className={th}>Expires</th><th className={th}>Redemptions</th><th className={th}>Status</th><th className={th}></th></tr></thead>
          <tbody className="divide-y divide-border">
            {db.promos.map((p) => (
              <tr key={p.code}>
                <td className={td + " font-semibold"}>{p.code}</td>
                <td className={td}>{p.type === "percent" ? `${p.value}%` : gbp(p.value)}</td>
                <td className={td}>{p.minOrder ? gbp(p.minOrder) : "—"}</td>
                <td className={td}>{p.expires || "—"}</td>
                <td className={td}>{p.used}{p.limit ? ` / ${p.limit}` : ""}</td>
                <td className={td}><button onClick={() => toggle(p)} className={`caps px-2 py-0.5 text-[0.6rem] ${p.active ? "bg-accent text-accent-foreground" : "bg-muted"}`}>{p.active ? "Enabled" : "Disabled"}</button></td>
                <td className={td}><div className="flex gap-1"><button className={btnGhost} onClick={() => { setOrig(p.code); setEdit(p); }}>Edit</button>
                  <Confirm trigger={<button className={btnGhost + " text-destructive"}>Delete</button>} title={`Delete ${p.code}?`} description="Customers will no longer be able to use this code." onConfirm={() => { set((d) => ({ ...d, promos: d.promos.filter((x) => x.code !== p.code) })); log(`Deleted promo ${p.code}`); }} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
