import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminTitle, Confirm, Panel, btn, btnGhost, inputCls } from "@/components/admin/ui";
import { CATEGORIES, type Product } from "@/lib/catalog";
import { uid, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/products_/$id")({ component: EditProduct });

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 800, c = document.createElement("canvas");
        const s = Math.min(img.width, img.height);
        c.width = c.height = size;
        c.getContext("2d")!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        resolve(c.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = r.result as string;
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function EditProduct() {
  const { id } = Route.useParams();
  const { db, set, log } = useStore();
  const navigate = useNavigate();
  const isNew = id === "new";
  const existing = db.products.find((p) => p.id === id);
  const blank: Product = {
    id: "", slug: "", name: "", sku: "", category: "totes", price: 39.99, cost: 15, stock: 10, colour: "Natural", materials: "", dimensions: "",
    care: "Spot clean with a damp cloth.", description: "", images: [], collections: ["new-arrivals"], tags: [], icon: "leaf", status: "draft",
    featured: false, isNew: true, bestSeller: false, createdAt: new Date().toISOString().slice(0, 10),
  };
  const [p, setP] = useState<Product>(existing ?? blank);
  const [tags, setTags] = useState((existing?.tags ?? []).join(", "));
  const [pick, setPick] = useState(false);
  useEffect(() => { if (existing) { setP(existing); setTags(existing.tags.join(", ")); } }, [existing?.id]);
  if (!isNew && !existing) return <p>Product not found. <Link to="/admin/products" className="underline">Back</Link></p>;
  const up = <K extends keyof Product>(k: K, v: Product[K]) => setP((s) => ({ ...s, [k]: v }));
  const allImages = Array.from(new Set(db.products.flatMap((x) => x.images))).filter((x) => !x.startsWith("data:"));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (p.name.trim().length < 2) return toast.error("Name is required.");
    if (!(p.price > 0)) return toast.error("Price must be above £0.");
    if (p.salePrice && p.salePrice >= p.price) return toast.error("Sale price must be lower than price.");
    if (p.images.length === 0) return toast.error("Add at least one photo.");
    const slug = p.slug || slugify(p.name);
    if (db.products.some((x) => x.slug === slug && x.id !== p.id)) return toast.error("Another product already uses this URL slug.");
    const final: Product = { ...p, slug, name: p.name.trim(), sku: p.sku || `GG-${p.category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`, tags: tags.split(",").map((t) => t.trim()).filter(Boolean), stock: Math.max(0, Math.floor(p.stock)) };
    if (isNew) {
      final.id = uid("p");
      set((d) => ({ ...d, products: [...d.products, final] }));
      log(`Added product ${final.name}`);
    } else {
      set((d) => ({ ...d, products: d.products.map((x) => (x.id === final.id ? final : x)) }));
      log(`Updated product ${final.name}`);
    }
    toast.success(isNew ? "Product added" : "Product saved");
    navigate({ to: "/admin/products" });
  };
  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    try {
      const urls = await Promise.all([...files].slice(0, 4).map(resizeImage));
      setP((s) => ({ ...s, images: [...s.images, ...urls] }));
    } catch { toast.error("Couldn't read that image."); }
  };
  const field = (label: string, el: React.ReactNode) => <label className="block text-sm">{label}{el}</label>;

  return (
    <form onSubmit={save}>
      <AdminTitle title={isNew ? "Add product" : p.name} sub={isNew ? "New product" : p.sku}>
        <Link to="/admin/products" className={btnGhost}><ArrowLeft className="h-3 w-3" /> Back</Link>
        {!isNew && <Link to="/product/$slug" params={{ slug: p.slug }} target="_blank" className={btnGhost}>Preview</Link>}
        <button className={btn}>Save</button>
      </AdminTitle>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Panel title="Details">
            <div className="space-y-3">
              {field("Name", <input value={p.name} onChange={(e) => up("name", e.target.value)} maxLength={100} className={inputCls} required />)}
              {field("Description", <textarea rows={4} value={p.description} onChange={(e) => up("description", e.target.value)} maxLength={1000} className={inputCls} />)}
              <div className="grid gap-3 sm:grid-cols-2">
                {field("URL slug", <input value={p.slug} placeholder={slugify(p.name) || "auto"} onChange={(e) => up("slug", slugify(e.target.value))} className={inputCls} />)}
                {field("SKU", <input value={p.sku} placeholder="auto" onChange={(e) => up("sku", e.target.value)} className={inputCls} />)}
              </div>
            </div>
          </Panel>
          <Panel title="Photos">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {p.images.map((src, i) => (
                <div key={i} className="group relative">
                  <img src={src} alt="" className={`aspect-square w-full object-cover ${i === 0 ? "ring-2 ring-gold" : ""}`} />
                  <button type="button" onClick={() => up("images", p.images.filter((_, j) => j !== i))} className="absolute right-1 top-1 bg-card p-1" aria-label="Remove photo"><X className="h-3 w-3" /></button>
                  {i > 0 && <button type="button" onClick={() => up("images", [src, ...p.images.filter((_, j) => j !== i)])} className="caps absolute bottom-1 left-1 bg-card px-1 text-[0.55rem]">Make main</button>}
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center border border-dashed border-border text-xs text-muted-foreground hover:border-gold">
                <Upload className="mb-1 h-4 w-4" /> Upload
                <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
              </label>
              <button type="button" onClick={() => setPick((x) => !x)} className="flex aspect-square items-center justify-center border border-dashed border-border text-xs text-muted-foreground hover:border-gold">Choose existing</button>
            </div>
            {pick && (
              <div className="mt-3 grid max-h-64 grid-cols-5 gap-2 overflow-auto border border-border p-2 sm:grid-cols-8">
                {allImages.map((src) => <button type="button" key={src} onClick={() => up("images", [...p.images, src])}><img src={src} alt="" className="aspect-square w-full object-cover hover:opacity-70" /></button>)}
              </div>
            )}
          </Panel>
          <Panel title="Pricing & stock">
            <div className="grid gap-3 sm:grid-cols-4">
              {field("Price (£)", <input type="number" step="0.01" min="0" value={p.price} onChange={(e) => up("price", +e.target.value)} className={inputCls} />)}
              {field("Sale price (£)", <input type="number" step="0.01" min="0" value={p.salePrice ?? ""} onChange={(e) => up("salePrice", e.target.value ? +e.target.value : undefined)} className={inputCls} />)}
              {field("Cost (£)", <input type="number" step="0.01" min="0" value={p.cost} onChange={(e) => up("cost", +e.target.value)} className={inputCls} />)}
              {field("Stock", <input type="number" min="0" value={p.stock} onChange={(e) => up("stock", +e.target.value)} className={inputCls} />)}
            </div>
          </Panel>
          <Panel title="Product information">
            <div className="grid gap-3 sm:grid-cols-2">
              {field("Materials", <input value={p.materials} onChange={(e) => up("materials", e.target.value)} className={inputCls} />)}
              {field("Colour", <input value={p.colour} onChange={(e) => up("colour", e.target.value)} className={inputCls} />)}
              {field("Dimensions", <input value={p.dimensions} onChange={(e) => up("dimensions", e.target.value)} className={inputCls} />)}
              {field("Care", <input value={p.care} onChange={(e) => up("care", e.target.value)} className={inputCls} />)}
            </div>
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel title="Status">
            <select aria-label="Status" value={p.status} onChange={(e) => up("status", e.target.value as Product["status"])} className={inputCls}><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select>
            <div className="mt-3 space-y-2 text-sm">
              {([["featured", "Featured on home page"], ["isNew", "Mark as new"], ["bestSeller", "Best seller"]] as const).map(([k, l]) => (
                <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={p[k]} onChange={(e) => up(k, e.target.checked)} /> {l}</label>
              ))}
            </div>
          </Panel>
          <Panel title="Organisation">
            {field("Category", <select value={p.category} onChange={(e) => up("category", e.target.value as Product["category"])} className={inputCls}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>)}
            <p className="mt-3 text-sm">Collections</p>
            <div className="mt-1 space-y-1 text-sm">
              {db.collections.map((c) => (
                <label key={c.slug} className="flex items-center gap-2"><input type="checkbox" checked={p.collections.includes(c.slug)} onChange={() => up("collections", p.collections.includes(c.slug) ? p.collections.filter((x) => x !== c.slug) : [...p.collections, c.slug])} /> {c.name}</label>
              ))}
            </div>
            <div className="mt-3">{field("Tags (comma separated)", <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls} />)}</div>
            <div className="mt-3">{field("Icon", <select value={p.icon} onChange={(e) => up("icon", e.target.value)} className={inputCls}>{["leaf", "flower", "circle", "star", "bag", "sprig", "arch"].map((i) => <option key={i}>{i}</option>)}</select>)}</div>
          </Panel>
          {!isNew && (
            <Confirm trigger={<button type="button" className={btnGhost + " w-full justify-center text-destructive"}><Trash2 className="h-3 w-3" /> Delete product</button>} title={`Delete ${p.name}?`} description="This permanently removes the product from the demo store."
              onConfirm={() => { set((d) => ({ ...d, products: d.products.filter((x) => x.id !== p.id) })); log(`Deleted ${p.name}`); toast.success("Product deleted"); navigate({ to: "/admin/products" }); }} />
          )}
        </div>
      </div>
    </form>
  );
}
