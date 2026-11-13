import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminTitle, Confirm, Panel, btn, btnGhost, inputCls, td, th } from "@/components/admin/ui";
import { StatusPill } from "@/components/site/order-status";
import { gbp } from "@/lib/catalog";
import { useStore, type User } from "@/lib/store";

export const Route = createFileRoute("/admin/customers")({ component: Customers });

function Customers() {
  const { db, set, log } = useStore();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<User | null>(null);
  const stats = (u: User) => { const os = db.orders.filter((o) => o.userId === u.id); return { count: os.length, spent: os.filter((o) => o.status !== "cancelled" && o.status !== "refunded").reduce((s, o) => s + o.total, 0), orders: os }; };
  const list = db.users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  const save = () => {
    if (!sel) return;
    set((d) => ({ ...d, users: d.users.map((u) => (u.id === sel.id ? sel : u)) }));
    log(`Updated customer ${sel.name}`); toast.success("Customer saved");
  };
  return (
    <>
      <AdminTitle title="Customers" sub={`${db.users.length} demo customers`} />
      <input aria-label="Search customers" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} className={inputCls + " mb-4 mt-0 max-w-sm"} />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border"><tr><th className={th}>Name</th><th className={th}>Email</th><th className={th}>Orders</th><th className={th}>Spent</th><th className={th}>Status</th></tr></thead>
            <tbody className="divide-y divide-border">
              {list.map((u) => { const s = stats(u); return (
                <tr key={u.id} onClick={() => setSel(u)} className={`cursor-pointer hover:bg-muted/40 ${sel?.id === u.id ? "bg-muted/60" : ""}`}>
                  <td className={td}>{u.name} {u.tags.map((t) => <span key={t} className="caps ml-1 bg-gold-soft px-1 text-[0.55rem]">{t}</span>)}</td>
                  <td className={td + " text-muted-foreground"}>{u.email}</td><td className={td}>{s.count}</td><td className={td}>{gbp(s.spent)}</td><td className={td}>{u.active ? "Active" : "Deactivated"}</td>
                </tr>); })}
            </tbody>
          </table>
        </div>
        {sel ? (
          <Panel title={sel.name}>
            <div className="space-y-3 text-sm">
              <label className="block">Name<input value={sel.name} onChange={(e) => setSel({ ...sel, name: e.target.value })} className={inputCls} /></label>
              <label className="block">Email<input value={sel.email} onChange={(e) => setSel({ ...sel, email: e.target.value })} className={inputCls} /></label>
              <label className="block">Phone<input value={sel.phone ?? ""} onChange={(e) => setSel({ ...sel, phone: e.target.value })} className={inputCls} /></label>
              <label className="block">Tags (comma separated)<input value={sel.tags.join(", ")} onChange={(e) => setSel({ ...sel, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} className={inputCls} /></label>
              <label className="block">Internal notes<textarea rows={3} value={sel.notes} onChange={(e) => setSel({ ...sel, notes: e.target.value })} className={inputCls} /></label>
              <div><p className="caps text-[0.6rem] text-muted-foreground">Addresses</p>{sel.addresses.map((a) => <p key={a.id}>{a.line1}, {a.city} {a.postcode}, {a.country}</p>)}{sel.addresses.length === 0 && <p className="text-muted-foreground">None saved</p>}</div>
              <div><p className="caps text-[0.6rem] text-muted-foreground">Orders</p>{stats(sel).orders.map((o) => <p key={o.id} className="flex items-center justify-between"><Link to="/admin/orders" search={{ id: o.id }} className="underline">{o.id}</Link><StatusPill s={o.status} /><span>{gbp(o.total)}</span></p>)}</div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button onClick={save} className={btn}>Save</button>
                <button onClick={() => { const u = { ...sel, active: !sel.active }; setSel(u); set((d) => ({ ...d, users: d.users.map((x) => (x.id === u.id ? u : x)) })); log(`${u.active ? "Reactivated" : "Deactivated"} ${u.name}`); }} className={btnGhost}>{sel.active ? "Deactivate" : "Reactivate"}</button>
                <Confirm trigger={<button className={btnGhost + " text-destructive"}>Delete</button>} title={`Delete ${sel.name}?`} description="Removes this demo customer record. Their orders remain." onConfirm={() => { set((d) => ({ ...d, users: d.users.filter((x) => x.id !== sel.id), sessionUserId: d.sessionUserId === sel.id ? null : d.sessionUserId })); log(`Deleted customer ${sel.name}`); setSel(null); }} />
              </div>
            </div>
          </Panel>
        ) : <Panel><p className="text-sm text-muted-foreground">Select a customer to view their profile.</p></Panel>}
      </div>
    </>
  );
}
