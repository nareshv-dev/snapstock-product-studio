import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Corners, FleurRule } from "@/components/site/ornaments";
import { gbp } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { seo } from "@/lib/seo";
import { ReceiptButton } from "@/components/site/receipt-button";

export const Route = createFileRoute("/order-success/$id")({
  head: () => ({ meta: [...seo("Payment Successful", "Thank you for your Gray & Gable order."), { name: "robots", content: "noindex" }] }),
  component: Success,
});

function Success() {
  const { id } = Route.useParams();
  const { db, hydrated } = useStore();
  const o = db.orders.find((x) => x.id === id);
  if (!hydrated) return <div className="py-32" />;
  return (
    <section className="relative overflow-hidden px-4 py-20 text-center">
      <Corners />
      <CheckCircle2 className="mx-auto h-14 w-14 text-gold" strokeWidth={1.2} />
      <p className="caps mt-4 text-xs text-muted-foreground">Payment successful</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">Thank you{o ? `, ${o.name.split(" ")[0]}` : ""}</h1>
      <FleurRule className="mt-4" />
      <p className="mt-4 text-lg">Order number <strong className="font-serif text-2xl">{id}</strong></p>
      {o && (
        <div className="mx-auto mt-8 max-w-md border border-border bg-card p-6 text-left text-sm">
          {o.items.map((i) => <p key={i.productId} className="flex justify-between py-1"><span>{i.name} × {i.qty}</span><span>{gbp(i.price * i.qty)}</span></p>)}
          <p className="mt-3 flex justify-between border-t border-border pt-3 font-semibold"><span>Total paid</span><span>{gbp(o.total)}</span></p>
          <p className="mt-3 text-muted-foreground">A confirmation would be sent to {o.email}. Delivery: {o.delivery}.</p>
        </div>
      )}
      <p className="mt-6 text-xs text-muted-foreground">This is a demonstration — no payment was taken.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {o && <ReceiptButton order={o} />}
        <Link to="/shop" className="caps bg-primary px-8 py-3 text-xs text-primary-foreground">Continue shopping</Link>
        {o?.userId && <Link to="/account/orders/$id" params={{ id }} className="caps border border-foreground px-8 py-3 text-xs">View order</Link>}
      </div>
    </section>
  );
}
