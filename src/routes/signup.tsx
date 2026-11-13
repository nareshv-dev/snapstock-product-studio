import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeading } from "@/components/site/ornaments";
import { uid, useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/signup")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => (typeof s.redirect === "string" && s.redirect.startsWith("/") ? { redirect: s.redirect } : {}),
  head: () => ({ meta: seo("Create Account", "Create a Gray & Gable account to track orders and save addresses.") }),
  component: Signup,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(100),
});

function Signup() {
  const { db, set, log } = useStore();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) { const x: Record<string, string> = {}; r.error.issues.forEach((i) => (x[String(i.path[0])] ??= i.message)); return setErrors(x); }
    if (db.users.some((u) => u.email.toLowerCase() === r.data.email.toLowerCase())) return setErrors({ email: "An account with this email already exists." });
    const id = uid("u");
    set((d) => ({ ...d, sessionUserId: id, users: [...d.users, { id, ...r.data, email: r.data.email.toLowerCase(), addresses: [], notes: "", tags: [], active: true, createdAt: new Date().toISOString().slice(0, 10) }] }));
    log(`New customer account: ${r.data.name}`);
    toast.success("Your account is ready");
    navigate({ to: redirect ?? "/account" });
  };
  const field = (k: keyof typeof f, label: string, type = "text") => (
    <label className="block text-sm">{label}
      <input type={type} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={!!errors[k]} className={`mt-1 w-full border bg-card px-3 py-2.5 ${errors[k] ? "border-destructive" : "border-input"}`} />
      {errors[k] && <span className="mt-1 block text-xs text-destructive">{errors[k]}</span>}
    </label>
  );
  return (
    <>
      <PageHeading title="Create Account">Accounts are stored only in this browser for the demo.</PageHeading>
      <form onSubmit={submit} noValidate className="mx-auto max-w-md space-y-4 px-4 py-10">
        {field("name", "Full name")}{field("email", "Email", "email")}{field("password", "Password", "password")}
        <button className="caps w-full bg-primary py-3 text-xs text-primary-foreground">Create account</button>
        <p className="text-center text-sm">Already registered? <Link to="/login" className="underline">Sign in</Link></p>
      </form>
    </>
  );
}
