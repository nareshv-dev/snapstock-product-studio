import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminTitle, Panel, Stat, btnGhost, downloadCSV, inputCls, td, th } from "@/components/admin/ui";
import { gbp } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/reports")({ component: Reports });

function Reports() {
  const { db } = useStore();
  const [from, setFrom] = useState("2026-01-01");
  const [to, setTo] = useState("2026-12-31");
  const orders = db.orders.filter((o) => o.createdAt.slice(0, 10) >= from && o.createdAt.slice(0, 10) <= to && o.status !== "cancelled" && o.status !== "refunded");
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const units = orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);
  const byDay = useMemo(() => {
    const m = new Map<string, number>();
    orders.forEach((o) => { const k = o.createdAt.slice(0, 10); m.set(k, (m.get(k) ?? 0) + o.total); });
    return [...m.entries()].sort().map(([date, sales]) => ({ date: date.slice(5), sales: +sales.toFixed(2) }));
  }, [orders]);
  const byProduct = db.products.map((p) => {
    const u = orders.reduce((s, o) => s + (o.items.find((i) => i.productId === p.id)?.qty ?? 0), 0);
    return { name: p.name, units: u, revenue: orders.reduce((s, o) => { const i = o.items.find((x) => x.productId === p.id); return s + (i ? i.price * i.qty : 0); }, 0), stockValue: p.stock * p.cost };
  }).sort((a, b) => b.units - a.units);
  const byCollection = db.collections.map((c) => ({ name: c.name.replace(" Collection", ""), revenue: +orders.reduce((s, o) => s + o.items.filter((i) => db.products.find((p) => p.id === i.productId)?.collections.includes(c.slug)).reduce((a, i) => a + i.price * i.qty, 0), 0).toFixed(2) }));
  return (
    <>
      <AdminTitle title="Sales & reporting" sub="Simulated figures from demo orders">
        <label className="text-xs">From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls + " mt-0"} /></label>
        <label className="text-xs">To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls + " mt-0"} /></label>
        <button className={btnGhost} onClick={() => downloadCSV("sales-report.csv", [["Product", "Units", "Revenue", "Stock value"], ...byProduct.map((p) => [p.name, p.units, p.revenue.toFixed(2), p.stockValue.toFixed(2)])])}><Download className="h-3 w-3" /> Export CSV</button>
      </AdminTitle>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Estimated revenue" value={gbp(revenue)} /><Stat label="Orders" value={String(orders.length)} /><Stat label="Units sold" value={String(units)} /><Stat label="Avg order value" value={gbp(orders.length ? revenue / orders.length : 0)} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Sales by date"><div className="h-60"><ResponsiveContainer><LineChart data={byDay}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" /><XAxis dataKey="date" fontSize={11} /><YAxis fontSize={11} /><Tooltip formatter={(v: number) => gbp(v)} /><Line dataKey="sales" stroke="var(--gold)" strokeWidth={2} /></LineChart></ResponsiveContainer></div></Panel>
        <Panel title="Sales by collection"><div className="h-60"><ResponsiveContainer><BarChart data={byCollection} layout="vertical"><XAxis type="number" fontSize={11} /><YAxis type="category" dataKey="name" width={120} fontSize={10} /><Tooltip formatter={(v: number) => gbp(v)} /><Bar dataKey="revenue" fill="var(--gold)" /></BarChart></ResponsiveContainer></div></Panel>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Top-selling & slow-moving">
          <table className="w-full text-sm"><thead><tr><th className={th}>Product</th><th className={th}>Units</th><th className={th}>Revenue</th></tr></thead>
            <tbody className="divide-y divide-border">{byProduct.map((p) => <tr key={p.name} className={p.units === 0 ? "text-muted-foreground" : ""}><td className={td}>{p.name}{p.units === 0 && " (slow)"}</td><td className={td}>{p.units}</td><td className={td}>{gbp(p.revenue)}</td></tr>)}</tbody></table>
        </Panel>
        <Panel title="Inventory valuation">
          <p className="mb-2 font-serif text-2xl">{gbp(byProduct.reduce((s, p) => s + p.stockValue, 0))} <span className="text-sm text-muted-foreground">at cost</span></p>
          <table className="w-full text-sm"><tbody className="divide-y divide-border">{[...byProduct].sort((a, b) => b.stockValue - a.stockValue).map((p) => <tr key={p.name}><td className={td}>{p.name}</td><td className={td + " text-right"}>{gbp(p.stockValue)}</td></tr>)}</tbody></table>
        </Panel>
      </div>
    </>
  );
}
