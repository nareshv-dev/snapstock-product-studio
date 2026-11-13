import type { Order } from "@/lib/store";

const money = (n: number) => `£${n.toFixed(2)}`;

/** Builds a PDF payment receipt for an order (browser-only, lazy-loads pdf-lib). */
export async function buildReceipt(o: Order): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  doc.setTitle(`Receipt ${o.id}`);
  const page = doc.addPage([595, 842]);
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifB = await doc.embedFont(StandardFonts.TimesRomanBold);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const sansB = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.18, 0.15, 0.13), gold = rgb(0.66, 0.51, 0.29), muted = rgb(0.45, 0.4, 0.35), paper = rgb(0.98, 0.96, 0.93);
  const W = 595, L = 50, R = W - 50;
  page.drawRectangle({ x: 0, y: 0, width: W, height: 842, color: paper });
  page.drawRectangle({ x: 20, y: 20, width: W - 40, height: 802, borderColor: gold, borderWidth: 0.8 });
  const text = (s: string, x: number, y: number, size = 10, font = sans, color = ink) => page.drawText(s, { x, y, size, font, color });
  const right = (s: string, y: number, size = 10, font = sans, color = ink) => text(s, R - font.widthOfTextAtSize(s, size), y, size, font, color);
  const line = (y: number) => page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness: 0.6, color: gold });

  // Header
  page.drawRectangle({ x: L, y: 742, width: 44, height: 44, color: rgb(0.23, 0.21, 0.2) });
  text("GG", L + 9, 758, 18, serif, gold);
  text("GRAY & GABLE", L + 58, 768, 18, serifB);
  text("LONDON", L + 58, 752, 9, sans, gold);
  right("PAYMENT RECEIPT", 768, 14, serifB);
  right(o.id, 752, 10, sans, muted);
  line(728);

  let y = 700;
  text("Billed to", L, y, 9, sansB, gold); text("Receipt details", 330, y, 9, sansB, gold);
  y -= 16;
  const a = o.address;
  const left = [o.name, o.email, a.line1, a.line2, `${a.city} ${a.postcode}`, a.country].filter(Boolean) as string[];
  const date = new Date(o.createdAt).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" });
  const rightCol = [`Date: ${date}`, `Payment: ${o.paymentStatus === "refunded" ? "Refunded" : "Paid"}`, `Method: ${o.notes || "Card (simulated)"}`, `Delivery: ${o.delivery}`];
  for (let i = 0; i < Math.max(left.length, rightCol.length); i++) {
    if (left[i]) text(left[i]!, L, y, 10);
    if (rightCol[i]) text(rightCol[i]!.slice(0, 48), 330, y, 10);
    y -= 15;
  }

  y -= 15;
  page.drawRectangle({ x: L, y: y - 6, width: R - L, height: 22, color: rgb(0.95, 0.92, 0.87) });
  text("Item", L + 8, y, 9, sansB); text("Qty", 360, y, 9, sansB); text("Price", 410, y, 9, sansB); right("Amount", y, 9, sansB);
  y -= 26;
  for (const i of o.items) {
    text(i.name.slice(0, 50), L + 8, y, 10); text(String(i.qty), 362, y, 10); text(money(i.price), 410, y, 10); right(money(i.price * i.qty), y, 10);
    y -= 20;
  }
  line(y + 8);
  y -= 14;
  const row = (k: string, v: string, bold = false) => { text(k, 360, y, bold ? 12 : 10, bold ? sansB : sans); right(v, y, bold ? 12 : 10, bold ? sansB : sans); y -= bold ? 22 : 17; };
  row("Subtotal", money(o.subtotal));
  if (o.discount > 0) row(`Discount${o.promo ? ` (${o.promo})` : ""}`, `-${money(o.discount)}`);
  row("Delivery", o.shipping === 0 ? "Free" : money(o.shipping));
  page.drawLine({ start: { x: 360, y: y + 10 }, end: { x: R, y: y + 10 }, thickness: 0.6, color: gold });
  y -= 4;
  row(o.paymentStatus === "refunded" ? "Total refunded" : "Total paid", money(o.total), true);

  const msg = "Thank you for choosing Gray & Gable London.";
  text(msg, (W - serif.widthOfTextAtSize(msg, 14)) / 2, 120, 14, serif);
  line(95);
  const note = "Demonstration receipt — no real payment was taken. Prices include VAT.";
  text(note, (W - sans.widthOfTextAtSize(note, 8)) / 2, 78, 8, sans, muted);

  const bytes = await doc.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
