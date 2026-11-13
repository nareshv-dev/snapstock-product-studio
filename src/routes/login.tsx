import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeading } from "@/components/site/ornaments";
import { useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => (typeof s.redirect === "string" && s.redirect.startsWith("/") ? { redirect: s.redirect } : {}),
  head: () => ({ meta: seo("Sign In", "Sign in to your Gray & Gable account.") }),
  component: Login,
});

function Login() {
  const { db, set } = useStore();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password && x.active);
    if (!u) return setErr("Email or password is incorrect.");
    set((d) => ({ ...d, sessionUserId: u.id }));
    toast.success(`Welcome back, ${u.name.split(" ")[0]}`);
    navigate({ to: redirect ?? "/account" });
  };
  return (
    <>
      <PageHeading title="Sign In" />
      <form onSubmit={submit} className="mx-auto max-w-md space-y-4 px-4 py-10">
        {redirect === "/checkout" && <p role="status" className="border border-gold bg-gold/10 p-3 text-sm">Please sign in to complete your purchase.</p>}
        <div className="flex flex-wrap items-center justify-between gap-2 border border-gold/60 bg-card p-3 text-sm"><span>Demo account: <strong>demo@grayandgable.co.uk</strong> / <strong>demo1234</strong></span><button type="button" onClick={() => { setEmail("demo@grayandgable.co.uk"); setPassword("demo1234"); }} className="caps border border-foreground/40 px-3 py-1.5 text-[0.6rem] hover:border-gold hover:text-gold">Use demo login</button></div>
        <label className="block text-sm">Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border border-input bg-card px-3 py-2.5" /></label>
        <label className="block text-sm">Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border border-input bg-card px-3 py-2.5" /></label>
        {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        <button className="caps w-full bg-primary py-3 text-xs text-primary-foreground">Sign in</button>
        <p className="text-center text-sm">New here? <Link to="/signup" search={redirect ? { redirect } : {}} className="underline">Create an account</Link></p>
      </form>
    </>
  );
}
