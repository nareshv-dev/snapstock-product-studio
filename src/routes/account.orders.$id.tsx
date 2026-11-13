import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PageHeading } from "@/components/site/ornaments";
import { StatusPill } from "@/components/site/order-status";
import { gbp } from "@/lib/catalog";
import { useSession, useStore } from "@/lib/store";
import { seo } from "@/lib/seo";
import { ReceiptButton } from "@/components/site/receipt-button";

export const Route = createFileRoute("/account/orders/$id")({
  head: () => ({ meta: [...seo("Order Details", "Details of your Gray & Gable order."), { name: "robots", content: "noindex" }] }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const { db, set, log, hydrated } = useStore();
  const user = useSession();
  if (!hydrated) return <div className="py-32" />;
  const o = db.orders.find((x) => x.id === id && x.userId === user?.id);
  if (!o) return <div className="py-32 text-center"><h1 className="text-4xl">Order not found</h1><Link to="/account" className="caps mt-4 inline-block text-xs underline">My account</Link></div>;
  const cancellable = o.status === "paid" || o.status === "pending" || o.status === "processing";
  const cancel = () => {
    set((d) => ({
      ...d,
      orders: d.orders.map((x) => (x.id === o.id ? { ...x, status: "cancelled", paymentStatus: "refunded" } : x)),
      products: d.products.map((p) => { const l = o.items.find((i) => i.productId === p.id); return l ? { ...p, stock: p.stock + l.qty } : p; }),
    }));
    log(`Order ${o.id} cancelled by customer`);
    toast.success("Order cancelled — a refund has been simulated.");
  };
  return (
    <>
      <PageHeading eyebrow="Order" title={o.id}><StatusPill s={o.status} /></PageHeading>
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1fr_300px]">
        <ul className="divide-y divide-border border-y border-border">
          {o.items.map((i) => (
            <li key={i.productId} className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 py-4">
              <img src={i.image} alt="" className="aspect-square w-16 object-cover" />
              <span className="min-w-0">{i.name} × {i.qty}</span>
              <span>{gbp(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <aside className="space-y-4 text-sm">
          <ReceiptButton order={o} className="w-full" />
          <div className="border border-border bg-card p-5">
            <p className="flex justify-between"><span>Subtotal</span><span>{gbp(o.subtotal)}</span></p>
            {o.discount > 0 && <p className="flex justify-between"><span>Discount</span><span>−{gbp(o.discount)}</span></p>}
            <p className="flex justify-between"><span>Delivery</span><span>{o.shipping ? gbp(o.shipping) : "Free"}</span></p>
            <p className="mt-2 flex justify-between border-t border-border pt-2 font-semibold"><span>Total</span><span>{gbp(o.total)}</span></p>
          </div>
          <div className="border border-border bg-card p-5">
            <p className="caps text-xs font-semibold">Delivering to</p>
            <p className="mt-2">{o.address.name}<br />{o.address.line1}<br />{o.address.city} {o.address.postcode}<br />{o.address.country}</p>
            <p className="mt-2 text-muted-foreground">{o.delivery}</p>
            {o.tracking && <p className="mt-2">Tracking: <strong>{o.tracking}</strong></p>}
          </div>
          {cancellable && (
            <AlertDialog>
              <AlertDialogTrigger asChild><button className="caps w-full border border-destructive py-3 text-xs text-destructive hover:bg-destructive/10">Cancel order</button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Cancel order {o.id}?</AlertDialogTitle><AlertDialogDescription>Your items will be released and a full refund simulated. This can't be undone.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Keep order</AlertDialogCancel><AlertDialogAction onClick={cancel}>Yes, cancel</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </aside>
      </div>
    </>
  );
}
