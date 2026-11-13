import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useState } from "react";
import { AdminTitle, Confirm, Panel, btnGhost, inputCls } from "@/components/admin/ui";
import { useStore, type Message, type Review } from "@/lib/store";

export const Route = createFileRoute("/admin/reviews")({ component: ReviewsPage });

function ReviewsPage() {
  const { db, set, log } = useStore();
  const [tab, setTab] = useState<"reviews" | "messages">("reviews");
  const [q, setQ] = useState("");
  const setReview = (id: string, status: Review["status"]) => { set((d) => ({ ...d, reviews: d.reviews.map((r) => (r.id === id ? { ...r, status } : r)) })); log(`Review ${status}`); };
  const setMsg = (id: string, patch: Partial<Message>) => set((d) => ({ ...d, messages: d.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
  const reviews = db.reviews.filter((r) => `${r.name} ${r.text}`.toLowerCase().includes(q.toLowerCase()));
  const messages = db.messages.filter((m) => `${m.name} ${m.subject} ${m.body}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <AdminTitle title="Reviews & messages" />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["reviews", "messages"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`caps border px-4 py-2 text-[0.65rem] ${tab === t ? "border-gold bg-card" : "border-border"}`}>{t} ({t === "reviews" ? db.reviews.filter((r) => r.status === "pending").length + " pending" : db.messages.filter((m) => m.status === "new").length + " new"})</button>)}
        <input aria-label="Search" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className={inputCls + " mt-0 ml-auto max-w-xs"} />
      </div>
      {tab === "reviews" ? (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Panel key={r.id}>
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{db.products.find((p) => p.id === r.productId)?.name ?? "Deleted product"} <span className="caps ml-2 text-[0.6rem] text-muted-foreground">{r.status}</span></p>
                  <div className="flex">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-gold text-gold" : "text-border"}`} />)}</div>
                  <p className="mt-1 text-sm">{r.text}</p><p className="text-xs text-muted-foreground">{r.name} · {r.date}</p>
                </div>
                <div className="flex flex-wrap items-start gap-1">
                  {r.status !== "approved" && <button className={btnGhost} onClick={() => setReview(r.id, "approved")}>Approve</button>}
                  {r.status !== "hidden" && <button className={btnGhost} onClick={() => setReview(r.id, "hidden")}>Hide</button>}
                  <Confirm trigger={<button className={btnGhost + " text-destructive"}>Delete</button>} title="Delete review?" description="This review will be removed permanently." onConfirm={() => { set((d) => ({ ...d, reviews: d.reviews.filter((x) => x.id !== r.id) })); log("Review deleted"); }} />
                </div>
              </div>
            </Panel>
          ))}
          {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews.</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Panel key={m.id}>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
                <div className="min-w-0">
                  <p className="font-semibold">{m.subject}</p>
                  <p className="text-xs text-muted-foreground">{m.name} · {m.email} · {m.date}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{m.body}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <select aria-label="Message status" value={m.status} onChange={(e) => { setMsg(m.id, { status: e.target.value as Message["status"] }); log(`Message marked ${e.target.value}`); }} className={inputCls + " mt-0"}><option value="new">New</option><option value="in progress">In progress</option><option value="resolved">Resolved</option></select>
                  <textarea aria-label="Internal notes" placeholder="Internal notes" rows={2} value={m.notes} onChange={(e) => setMsg(m.id, { notes: e.target.value })} className={inputCls + " mt-0"} />
                </div>
              </div>
            </Panel>
          ))}
          {messages.length === 0 && <p className="text-sm text-muted-foreground">No messages. Contact form submissions appear here.</p>}
        </div>
      )}
    </>
  );
}
