import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { BarChart3, Boxes, FolderTree, LayoutDashboard, LogOut, Menu, MessageSquare, Package, Percent, Settings, ShoppingCart, Store, Users, X, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DemoBadge } from "@/components/admin/ui";
import { Plaque } from "@/components/site/ornaments";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin | Gray & Gable London" }, { name: "description", content: "Demo store administration." }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/collections", label: "Collections", icon: FolderTree },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/discounts", label: "Discounts", icon: Percent },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/content", label: "Storefront", icon: FileText },
  { to: "/admin/reviews", label: "Reviews & messages", icon: MessageSquare },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function AdminLayout() {
  const { db, set, log, hydrated } = useStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  if (!hydrated) return <div className="min-h-screen bg-background" />;
  if (!db.adminSignedIn) return <AdminLogin />;
  const signOut = () => { set((d) => ({ ...d, adminSignedIn: false })); log("Admin signed out"); navigate({ to: "/admin" }); };
  const nav = (
    <nav className="flex flex-col gap-0.5" aria-label="Admin">
      {items.map((i) => (
        <Link key={i.to} to={i.to} onClick={() => setOpen(false)} activeOptions={{ exact: "exact" in i }} className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent" activeProps={{ className: "bg-sidebar-accent text-sidebar-primary" }}>
          <i.icon className="h-4 w-4" /> {i.label}
        </Link>
      ))}
    </nav>
  );
  const side = (
    <div className="flex h-full flex-col gap-6 bg-sidebar p-4 text-sidebar-foreground">
      <div className="flex items-center gap-3"><Plaque size="sm" /><div><p className="caps text-sm">Gray &amp; Gable</p><DemoBadge /></div></div>
      {nav}
      <div className="mt-auto space-y-1 border-t border-sidebar-border pt-3 text-sm">
        <Link to="/" className="flex items-center gap-3 px-3 py-2 hover:bg-sidebar-accent"><Store className="h-4 w-4" /> View storefront</Link>
        <button onClick={signOut} className="flex w-full items-center gap-3 px-3 py-2 hover:bg-sidebar-accent"><LogOut className="h-4 w-4" /> Sign out</button>
        <p className="px-3 pt-2 text-xs text-sidebar-foreground/60">Eleanor Gray · Owner</p>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen lg:block">{side}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64">{side}</div>
        </div>
      )}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open admin menu">{open ? <X /> : <Menu className="h-5 w-5" />}</button>
          <p className="caps text-xs text-muted-foreground">Admin · simulated data saved in this browser</p>
          <button onClick={() => toast("All records here are demo data.")} className="ml-auto"><DemoBadge /></button>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  );
}

function AdminLogin() {
  const { set, log } = useStore();
  const [email, setEmail] = useState("admin@grayandgable.co.uk");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() !== "admin@grayandgable.co.uk" || pw !== "admin123") return setErr("Incorrect admin email or password.");
    set((d) => ({ ...d, adminSignedIn: true }));
    log("Admin signed in");
  };
  return (
    <div className="parchment flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 border border-border bg-card p-8 shadow-xl">
        <div className="flex justify-center"><Plaque /></div>
        <h1 className="text-center text-3xl">Admin sign in</h1>
        <p className="border border-gold/60 p-2 text-center text-xs">Demo: admin@grayandgable.co.uk / admin123</p>
        <label className="block text-sm">Email<input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border border-input bg-background px-3 py-2" /></label>
        <label className="block text-sm">Password<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1 w-full border border-input bg-background px-3 py-2" /></label>
        {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        <button className="caps w-full bg-primary py-3 text-xs text-primary-foreground">Sign in</button>
        <Link to="/" className="block text-center text-xs underline">Back to store</Link>
      </form>
    </div>
  );
}
