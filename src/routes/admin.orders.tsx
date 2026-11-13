import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, Printer, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminTitle, Confirm, Panel, btn, btnGhost, downloadCSV, inputCls, td, th } from "@/components/admin/ui";
import { StatusPill } from "@/components/site/order-status";
import { gbp } from "@/lib/catalog";
import { useStore, type Order, type OrderStatus } from "@/lib/store";

export const Route = createFileRoute("/admin/orders")({
  validateSearch: (s: Record<string, unknown>): { id?: string } => (typeof s.id === "string" ? { id: s.id } : {}),
  component: Orders,
});

const STATUSES: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

function Orders() {
  const { id } = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/orders" });
  const { db } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [pay, setPay] = useState("");
  const [from, setFrom] = useState("");
  const [sort, setSort] = useState<"new" | "old" | "total">("new");
  const list = db.orders
    .filter((o) => (!q || `${o.id} ${o.name} ${o.email}`.toLowerCase().includes(q.toLowerCase())) && (!status || o.status === status) && (!pay || o.paymentStatus === pay) && (!from || o.createdAt >= from))
    .sort((a, b) => (sort === "total" ? b.total - a.total : sort === "old" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)));
  const open = db.orders.find((o) => o.id === id);
  return (
    <>
      <AdminTitle title="Orders" sub={`${db.orders.length} orders`}>
        <button className={btnGhost} onClick={() => downloadCSV("orders.csv", [["Order", "Date", "Customer", "Email", "Status", "Payment", "Total"], ...list.map((o) => [o.id, o.createdAt.slice(0, 10), o.name, o.email, o.status, o.paymentStatus, o.total])])}><Download className="h-3 w-3" /> Export</button>
      </AdminTitle>
      <div className="mb-4 grid gap-2 sm:grid-cols-5">
        <input aria-label="Search orders" placeholder="Order, name or email" value={q} onChange={(e) => setQ(e.target.value)} className={inputCls + " mt-0"} />
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls + " mt-0"}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <select aria-label="Payment" value={pay} onChange={(e) => setPay(e.target.value)} className={inputCls + " mt-0"}><option value="">All payments</option><option>paid</option><option>refunded</option><option>pending</option></select>
        <input aria-label="From date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls + " mt-0"} />
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={inputCls + " mt-0"}><option value="new">Newest</option><option value="old">Oldest</option><option value="total">Highest total</option></select>
      </div>
      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border"><tr><th className={th}>Order</th><th className={th}>Date</th><th className={th}>Customer</th><th className={th}>Status</th><th className={th}>Payment</th><th className={th}>Fulfilment</th><th className={th + " text-right"}>Total</th></tr></thead>
          <tbody className="divide-y divide-border">
            {list.map((o) => (
              <tr key={o.id} onClick={() => navigate({ search: { id: o.id } })} className="cursor-pointer hover:bg-muted/40">
                <td className={td + " font-semibold"}><button className="hover:text-gold">{o.id}</button></td>
                <td className={td}>{new Date(o.createdAt).toLocaleDateString("en-GB")}</td>
                <td className={td}>{o.name}</td>
                <td className={td}><StatusPill s={o.status} /></td>
                <td className={td + " capitalize"}>{o.paymentStatus}</td>
                <td className={td}>{o.status === "shipped" || o.status === "delivered" ? "Fulfilled" : o.status === "cancelled" || o.status === "refunded" ? "—" : "Unfulfilled"}</td>
                <td className={td + " text-right"}>{gbp(o.total)}</td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No orders match.</td></tr>}
          </tbody>
        </table>
      </div>
      {open && <OrderPanel o={open} onClose={() => navigate({ search: {} })} />}
    </>
  );
}

function OrderPanel({ o, onClose }: { o: Order; onClose: () => void }) {
  const { set, log } = useStore();
  const [tracking, setTracking] = useState(o.tracking);
  const [notes, setNotes] = useState(o.notes);
  const update = (patch: Partial<Order>, msg: string, restock = false) => {
    set((d) => ({
      ...d,
      orders: d.orders.map((x) => (x.id === o.id ? { ...x, ...patch } : x)),
      products: restock ? d.products.map((p) => { const l = o.items.find((i) => i.productId === p.id); return l ? { ...p, stock: p.stock + l.qty } : p; }) : d.products,
    }));
    log(`${o.id}: ${msg}`); toast.success(msg);
  };
  const printInvoice = () => {
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) return toast.error("Allow pop-ups to print the invoice.");
    const doc = w.document;
    doc.title = `Invoice ${o.id}`;
    const body = doc.body;
    body.style.fontFamily = "Georgia, serif"; body.style.padding = "40px";
    const h = doc.createElement("h1"); h.textContent = "Gray & Gable London — Invoice"; body.appendChild(h);
    const add = (t: string) => { const p = doc.createElement("p"); p.textContent = t; body.appendChild(p); };
    add(`${o.id} · ${new Date(o.createdAt).toLocaleDateString("en-GB")}`);
    add(`Bill to: ${o.name}, ${o.address.line1}, ${o.address.city} ${o.address.postcode}, ${o.address.country}`);
    o.items.forEach((i) => add(`${i.name} × ${i.qty} — ${gbp(i.price * i.qty)}`));
    add(`Subtotal ${gbp(o.subtotal)} · Discount ${gbp(o.discount)} · Delivery ${gbp(o.shipping)}`);
    add(`TOTAL ${gbp(o.total)} (incl. VAT)`);
    add("Demonstration invoice — no payment was taken.");
    w.print();
  };
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`Order ${o.id}`}>
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto bg-background p-6 shadow-2xl">
        <div className="flex items-center justify-between"><h2 className="text-3xl">{o.id}</h2><button onClick={onClose} aria-label="Close"><X /></button></div>
        <p className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleString("en-GB")} · <StatusPill s={o.status} /></p>
        <div className="mt-4 space-y-4">
          <Panel title="Items">
            {o.items.map((i) => <p key={i.productId} className="flex justify-between py-1 text-sm"><span>{i.name} × {i.qty}</span><span>{gbp(i.price * i.qty)}</span></p>)}
            <div className="mt-2 border-t border-border pt-2 text-sm">
              <p className="flex justify-between"><span>Subtotal</span><span>{gbp(o.subtotal)}</span></p>
              {o.discount > 0 && <p className="flex justify-between"><span>Discount {o.promo}</span><span>−{gbp(o.discount)}</span></p>}
              <p className="flex justify-between"><span>Delivery</span><span>{gbp(o.shipping)}</span></p>
              <p className="flex justify-between font-semibold"><span>Total</span><span>{gbp(o.total)}</span></p>
            </div>
          </Panel>
          <Panel title="Customer & delivery">
            <p className="text-sm">{o.name} · {o.email}<br />{o.address.line1}, {o.address.city} {o.address.postcode}, {o.address.country}<br /><span className="text-muted-foreground">{o.delivery} · Payment: {o.paymentStatus}</span></p>
          </Panel>
          <Panel title="Manage">
            <label className="block text-sm">Status
              <select value={o.status} onChange={(e) => update({ status: e.target.value as OrderStatus }, `Status set to ${e.target.value}`)} className={inputCls}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            </label>
            <label className="mt-3 block text-sm">Tracking number<input value={tracking} onChange={(e) => setTracking(e.target.value)} className={inputCls} /></label>
            <label className="mt-3 block text-sm">Internal notes<textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} /></label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className={btn} onClick={() => update({ tracking, notes, ...(tracking && !o.tracking && (o.status === "paid" || o.status === "processing") ? { status: "shipped" as const } : {}) }, "Order details saved")}>Save</button>
              <button className={btnGhost} onClick={printInvoice}><Printer className="h-3 w-3" /> Invoice</button>
              {o.status !== "cancelled" && o.status !== "refunded" && (
                <>
                  <Confirm trigger={<button className={btnGhost}>Cancel order</button>} action="Cancel order" title={`Cancel ${o.id}?`} description="Stock will be returned and payment refunded (simulated)." onConfirm={() => update({ status: "cancelled", paymentStatus: "refunded" }, "Order cancelled and refunded", true)} />
                  <Confirm trigger={<button className={btnGhost + " text-destructive"}>Refund</button>} action="Refund" title={`Refund ${gbp(o.total)}?`} description="Simulates a full refund to the customer." onConfirm={() => update({ status: "refunded", paymentStatus: "refunded" }, "Refund simulated", true)} />
                </>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
