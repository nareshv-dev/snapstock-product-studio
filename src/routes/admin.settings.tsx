import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminTitle, Confirm, Panel, btn, btnGhost, inputCls } from "@/components/admin/ui";
import { uid, useStore, type Settings, type Staff } from "@/lib/store";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  const { db, set, log, reset } = useStore();
  const [s, setS] = useState<Settings>(db.settings);
  const [staff, setStaff] = useState({ name: "", email: "", role: "Staff" as Staff["role"] });
  const num = (k: keyof Settings, l: string) => <label className="block text-sm">{l}<input type="number" step="0.01" min="0" value={s[k] as number} onChange={(e) => setS({ ...s, [k]: +e.target.value })} className={inputCls} /></label>;
  return (
    <>
      <AdminTitle title="Settings" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Store">
          <div className="space-y-3">
            <label className="block text-sm">Store name<input value={s.storeName} onChange={(e) => setS({ ...s, storeName: e.target.value })} className={inputCls} /></label>
            <label className="block text-sm">Currency<input value="GBP (£)" disabled className={inputCls + " opacity-60"} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.taxIncluded} onChange={(e) => setS({ ...s, taxIncluded: e.target.checked })} /> Prices include VAT</label>
            <div className="grid grid-cols-2 gap-3">{num("standard", "UK standard (£)")}{num("express", "Express / EU (£)")}{num("freeOver", "Free delivery over (£)")}{num("lowStock", "Low-stock threshold")}</div>
            <button className={btn} onClick={() => { set((d) => ({ ...d, settings: s })); log("Store settings updated"); toast.success("Settings saved"); }}>Save settings</button>
          </div>
        </Panel>
        <Panel title="Staff accounts (simulated)">
          <ul className="divide-y divide-border text-sm">
            {db.staff.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 py-2">
                <span className="min-w-0 truncate">{m.name}<br /><span className="text-xs text-muted-foreground">{m.email}</span></span>
                <select aria-label={`Role for ${m.name}`} value={m.role} disabled={m.role === "Owner"} onChange={(e) => { set((d) => ({ ...d, staff: d.staff.map((x) => (x.id === m.id ? { ...x, role: e.target.value as Staff["role"] } : x)) })); log(`${m.name} role → ${e.target.value}`); }} className="border border-input bg-background px-2 py-1 text-xs">
                  <option>Owner</option><option>Manager</option><option>Staff</option>
                </select>
                {m.role !== "Owner" && <button onClick={() => { set((d) => ({ ...d, staff: d.staff.filter((x) => x.id !== m.id) })); log(`Removed staff ${m.name}`); }} className="text-xs underline">Remove</button>}
              </li>
            ))}
          </ul>
          <form onSubmit={(e) => { e.preventDefault(); if (staff.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(staff.email)) return toast.error("Enter a name and valid email."); set((d) => ({ ...d, staff: [...d.staff, { id: uid("s"), ...staff }] })); log(`Invited ${staff.name} as ${staff.role}`); setStaff({ name: "", email: "", role: "Staff" }); toast.success("Staff member added"); }} className="mt-3 grid gap-2 sm:grid-cols-4">
            <input aria-label="Name" placeholder="Name" value={staff.name} onChange={(e) => setStaff({ ...staff, name: e.target.value })} className={inputCls + " mt-0"} />
            <input aria-label="Email" placeholder="Email" value={staff.email} onChange={(e) => setStaff({ ...staff, email: e.target.value })} className={inputCls + " mt-0"} />
            <select aria-label="Role" value={staff.role} onChange={(e) => setStaff({ ...staff, role: e.target.value as Staff["role"] })} className={inputCls + " mt-0"}><option>Manager</option><option>Staff</option></select>
            <button className={btn + " justify-center"}>Add</button>
          </form>
        </Panel>
        <Panel title="Demo data">
          <p className="mb-3 text-sm text-muted-foreground">All products, orders and customers live in this browser. Reset to start over with the original sample data.</p>
          <div className="flex flex-wrap gap-2">
            <Confirm trigger={<button className={btnGhost + " text-destructive"}>Restore sample data</button>} action="Restore" title="Restore sample data?" description="Every change made in the demo (products, orders, customers, settings) will be replaced with the original sample data." onConfirm={() => { reset(); toast.success("Sample data restored"); }} />
            <Confirm trigger={<button className={btnGhost + " text-destructive"}>Clear orders & customers</button>} action="Clear" title="Clear demo records?" description="Removes all orders, customers, reviews and messages." onConfirm={() => { set((d) => ({ ...d, orders: [], users: [], reviews: [], messages: [], sessionUserId: null })); log("Cleared demo records"); }} />
          </div>
        </Panel>
        <Panel title="Activity log">
          <ul className="max-h-72 space-y-2 overflow-auto text-sm">{db.activity.map((a, i) => <li key={i}><span className="text-xs text-muted-foreground">{new Date(a.date).toLocaleString("en-GB")}</span> — {a.text}</li>)}</ul>
        </Panel>
      </div>
    </>
  );
}
