import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { Order } from "@/lib/store";
import { buildReceipt, downloadBlob } from "@/lib/receipt";

/** Prebuilds the PDF so the click downloads instantly (keeps it working on phones). */
export function ReceiptButton({ order, className = "" }: { order: Order; className?: string }) {
  const [blob, setBlob] = useState<Blob | null>(null);
  useEffect(() => {
    let live = true;
    buildReceipt(order).then((b) => live && setBlob(b)).catch(() => toast.error("Couldn't prepare the receipt."));
    return () => { live = false; };
  }, [order]);
  return (
    <button type="button" disabled={!blob} onClick={() => { if (blob) { downloadBlob(blob, `Gray-Gable-receipt-${order.id}.pdf`); toast.success("Receipt downloaded"); } }}
      className={`caps inline-flex items-center justify-center gap-2 border border-gold px-8 py-3 text-xs hover:bg-gold/10 disabled:opacity-50 ${className}`}>
      <Download className="h-4 w-4" /> {blob ? "Download receipt" : "Preparing receipt…"}
    </button>
  );
}
