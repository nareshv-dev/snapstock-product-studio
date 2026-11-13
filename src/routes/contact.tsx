import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeading } from "@/components/site/ornaments";
import { uid, useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: seo("Contact Us", "Get in touch with the Gray & Gable London studio.") }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  subject: z.string().trim().min(2, "Add a subject").max(120),
  body: z.string().trim().min(10, "Message should be at least 10 characters").max(1000),
});

function Contact() {
  const { set } = useStore();
  const [f, setF] = useState({ name: "", email: "", subject: "", body: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) { const x: Record<string, string> = {}; r.error.issues.forEach((i) => (x[String(i.path[0])] ??= i.message)); return setErrors(x); }
    set((d) => ({ ...d, messages: [{ id: uid("m"), ...r.data, status: "new", notes: "", date: new Date().toISOString().slice(0, 10) }, ...d.messages] }));
    setF({ name: "", email: "", subject: "", body: "" }); setErrors({});
    toast.success("Thank you — we'll reply within one working day.");
  };
  const input = (k: keyof typeof f, label: string, area = false) => (
    <label className="block text-sm">{label}
      {area ? <textarea rows={5} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={`mt-1 w-full border bg-card px-3 py-2.5 ${errors[k] ? "border-destructive" : "border-input"}`} />
        : <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={`mt-1 w-full border bg-card px-3 py-2.5 ${errors[k] ? "border-destructive" : "border-input"}`} />}
      {errors[k] && <span className="mt-1 block text-xs text-destructive">{errors[k]}</span>}
    </label>
  );
  return (
    <>
      <PageHeading title="Contact Us">We'd love to hear from you.</PageHeading>
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-[1fr_280px]">
        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">{input("name", "Name")}{input("email", "Email")}</div>
          {input("subject", "Subject")}{input("body", "Message", true)}
          <button className="caps bg-primary px-8 py-3 text-xs text-primary-foreground">Send message</button>
        </form>
        <aside className="space-y-4 text-sm">
          <div className="border border-border bg-card p-5"><p className="caps text-xs font-semibold">Studio</p><p className="mt-2 text-muted-foreground">12 Marylebone Lane<br />London W1U 2NE</p></div>
          <div className="border border-border bg-card p-5"><p className="caps text-xs font-semibold">Hours</p><p className="mt-2 text-muted-foreground">Mon–Fri 9am–5:30pm<br />Sat 10am–4pm</p></div>
          <div className="border border-border bg-card p-5"><p className="caps text-xs font-semibold">Email</p><p className="mt-2 text-muted-foreground">hello@grayandgable.co.uk</p></div>
        </aside>
      </div>
    </>
  );
}
