import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminTitle, Panel, Stat, inputCls } from "@/components/admin/ui";
import { StatusPill } from "@/components/site/order-status";
import { gbp } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const { db } = useStore();
  const [range, setRange] = useState(90);
  const [col, setCol] = useState("");
  const since = useMemo(() => new Date(Date.now() - range * 864e5).toISOString(), [range]);
  const orders = db.orders.filter((o) => o.createdAt >= since && (!col || o.items.some((i) => db.products.find((p) => p.id === i.productId)?.collections.includes(col))));
  const paid = orders.filter((o) => o.status !== "cancelled" && o.status !== "refunded");
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const stockValue = db.products.reduce((s, p) => s + p.cost * p.stock, 0);
  const byWeek = useMemo(() => {
    const m = new Map<string, { week: string; sales: number; orders: number }>();
    paid.forEach((o) => {
      const d = new Date(o.createdAt); d.setDate(d.getDate() - d.getDay());
      const k = d.toISOString().slice(5, 10);
      const e = m.get(k) ?? { week: k, sales: 0, orders: 0 };
      e.sales += o.total; e.orders += 1; m.set(k, e);
    });
    return [...m.values()].sort((a, b) => a.week.localeCompare(b.week));
  }, [paid]);
  const top = useMemo(() => {
    const m = new Map<string, { name: string; units: number }>();
    paid.forEach((o) => o.items.forEach((i) => { const e = m.get(i.productId) ?? { name: i.name, units: 0 }; e.units += i.qty; m.set(i.productId, e); }));
    return [...m.values()].sort((a, b) => b.units - a.units).slice(0, 5);
  }, [paid]);
  const low = db.products.filter((p) => p.stock <= db.settings.lowStock && p.status !== "archived").sort((a, b) => a.stock - b.stock);
  return (
    <>
      <AdminTitle title="Dashboard" sub="Simulated store performance">
        <select aria-label="Date range" value={range} onChange={(e) => setRange(+e.target.value)} className={inputCls + " mt-0 w-auto"}>
          <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option><option value={3650}>All time</option>
        </select>
        <select aria-label="Collection" value={col} onChange={(e) => setCol(e.target.value)} className={inputCls + " mt-0 w-auto"}>
          <option value="">All collections</option>{db.collections.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </AdminTitle>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat label="Total sales" value={gbp(revenue)} />
        <Stat label="Orders" value={String(orders.length)} />
        <Stat label="Avg order" value={gbp(paid.length ? revenue / paid.length : 0)} />
        <Stat label="Customers" value={String(db.users.length)} />
        <Stat label="Products" value={String(db.products.filter((p) => p.status === "active").length)} />
        <Stat label="Stock value (cost)" value={gbp(stockValue)} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Sales over time" className="lg:col-span-2">
          {byWeek.length === 0 ? <p className="py-16 text-center text-sm text-muted-foreground">No sales in this range.</p> : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byWeek}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="week" fontSize={11} /><YAxis fontSize={11} /><Tooltip formatter={(v: number) => gbp(v)} /><Bar dataKey="sales" fill="var(--gold)" /></BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
        <Panel title="Top sellers">
          <ol className="space-y-2 text-sm">{top.map((t, i) => <li key={t.name} className="flex justify-between gap-2"><span className="truncate">{i + 1}. {t.name}</span><span className="shrink-0 text-muted-foreground">{t.units} sold</span></li>)}</ol>
          {top.length === 0 && <p className="text-sm text-muted-foreground">No sales yet.</p>}
        </Panel>
        <Panel title="Stock alerts">
          <ul className="space-y-2 text-sm">
            {low.map((p) => <li key={p.id} className="flex justify-between gap-2"><Link to="/admin/products/$id" params={{ id: p.id }} className="truncate hover:text-gold">{p.name}</Link><span className={p.stock === 0 ? "text-destructive" : "text-accent"}>{p.stock === 0 ? "Out of stock" : `${p.stock} left`}</span></li>)}
            {low.length === 0 && <li className="text-muted-foreground">All stock healthy.</li>}
          </ul>
        </Panel>
        <Panel title="Recent orders">
          <ul className="space-y-2 text-sm">{db.orders.slice(0, 6).map((o) => <li key={o.id} className="flex items-center justify-between gap-2"><Link to="/admin/orders" search={{ id: o.id }} className="hover:text-gold">{o.id}</Link><StatusPill s={o.status} /><span>{gbp(o.total)}</span></li>)}</ul>
        </Panel>
        <Panel title="Recent activity">
          <ul className="max-h-56 space-y-2 overflow-auto text-sm">{db.activity.slice(0, 12).map((a, i) => <li key={i}><span className="text-xs text-muted-foreground">{new Date(a.date).toLocaleString("en-GB")}</span><br />{a.text}</li>)}</ul>
        </Panel>
      </div>
    </>
  );
}
