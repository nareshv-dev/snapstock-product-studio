import type { ReactNode } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function AdminTitle({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      <div className="min-w-0">
        <h1 className="truncate text-3xl sm:text-4xl">{title}</h1>
        {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
      </div>
      <div className="flex flex-wrap justify-end gap-2">{children}</div>
    </div>
  );
}
export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`border border-border bg-card p-5 ${className}`}>
      {title && <h2 className="mb-3 text-xl">{title}</h2>}
      {children}
    </section>
  );
}
export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-border bg-card p-4">
      <p className="caps text-[0.6rem] text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-2xl font-semibold sm:text-3xl">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
export const inputCls = "mt-1 w-full border border-input bg-background px-3 py-2 text-sm";
export const btn = "caps inline-flex items-center gap-1.5 bg-primary px-4 py-2 text-[0.65rem] text-primary-foreground hover:bg-primary/90 disabled:opacity-50";
export const btnGhost = "caps inline-flex items-center gap-1.5 border border-border bg-card px-4 py-2 text-[0.65rem] hover:border-gold";
export const th = "caps whitespace-nowrap px-3 py-2 text-left text-[0.6rem] text-muted-foreground";
export const td = "px-3 py-2 align-middle";

export function Confirm({ trigger, title, description, onConfirm, action = "Delete" }: { trigger: ReactNode; title: string; description: string; onConfirm: () => void; action?: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{action}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function downloadCSV(name: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export function DemoBadge() {
  return <span className="caps bg-accent px-2 py-0.5 text-[0.55rem] text-accent-foreground">Demo mode</span>;
}
