import type { OrderStatus } from "@/lib/store";
const tone: Record<OrderStatus, string> = {
  pending: "bg-muted text-foreground", paid: "bg-secondary text-foreground", processing: "bg-gold-soft text-foreground",
  shipped: "bg-accent text-accent-foreground", delivered: "bg-primary text-primary-foreground",
  cancelled: "bg-destructive/15 text-destructive", refunded: "bg-destructive/15 text-destructive",
};
export function StatusPill({ s }: { s: OrderStatus }) {
  return <span className={`caps inline-block px-2 py-0.5 text-[0.6rem] ${tone[s]}`}>{s}</span>;
}
