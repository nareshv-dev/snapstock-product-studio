import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { seedCollections, seedProducts, priceOf, type Collection, type Product } from "./catalog";

export type CartItem = { productId: string; qty: number };
export type Address = { id: string; label: string; name: string; line1: string; line2?: string; city: string; postcode: string; country: string };
export type User = { id: string; name: string; email: string; password: string; phone?: string; addresses: Address[]; notes: string; tags: string[]; active: boolean; createdAt: string };
export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type OrderItem = { productId: string; name: string; price: number; qty: number; image: string };
export type Order = {
  id: string; userId?: string; email: string; name: string; items: OrderItem[];
  subtotal: number; discount: number; promo?: string; shipping: number; total: number;
  address: Omit<Address, "id" | "label">; delivery: string; status: OrderStatus; paymentStatus: "paid" | "refunded" | "pending";
  tracking: string; notes: string; createdAt: string;
};
export type Promo = { code: string; type: "percent" | "fixed"; value: number; minOrder: number; expires: string; limit: number; used: number; active: boolean };
export type Review = { id: string; productId: string; name: string; rating: number; text: string; status: "approved" | "hidden" | "pending"; date: string };
export type Message = { id: string; name: string; email: string; subject: string; body: string; status: "new" | "in progress" | "resolved"; notes: string; date: string };
export type Content = { announcement: string; heroTagline: string; heroRight: string; heroCta: string; newsletter: string; brandPanel: string };
export type Settings = { storeName: string; lowStock: number; standard: number; express: number; freeOver: number; taxIncluded: boolean };
export type Staff = { id: string; name: string; email: string; role: "Owner" | "Manager" | "Staff" };
export type Activity = { date: string; text: string };

export type DB = {
  products: Product[]; collections: Collection[]; users: User[]; orders: Order[]; promos: Promo[];
  reviews: Review[]; messages: Message[]; content: Content; settings: Settings; staff: Staff[]; activity: Activity[];
  cart: CartItem[]; wishlist: string[]; sessionUserId: string | null; adminSignedIn: boolean; newsletter: string[];
};

const addr = (name: string, line1: string, city: string, postcode: string) => ({ name, line1, city, postcode, country: "United Kingdom" });

export function seedDB(): DB {
  const products = seedProducts();
  const p = (slug: string) => products.find((x) => x.slug === slug)!;
  const item = (slug: string, qty = 1): OrderItem => ({ productId: p(slug).id, name: p(slug).name, price: p(slug).price, qty, image: p(slug).images[0] });
  const users: User[] = [
    { id: "u1", name: "Charlotte Hayes", email: "demo@grayandgable.co.uk", password: "demo1234", phone: "07700 900123",
      addresses: [{ id: "a1", label: "Home", ...addr("Charlotte Hayes", "14 Elgin Crescent", "London", "W11 2JA") }], notes: "", tags: ["VIP"], active: true, createdAt: "2026-03-02" },
    { id: "u2", name: "Amelia Clarke", email: "amelia.clarke@example.co.uk", password: "x", addresses: [{ id: "a2", label: "Home", ...addr("Amelia Clarke", "7 Royal Crescent", "Bath", "BA1 2LR") }], notes: "Prefers gift wrap", tags: [], active: true, createdAt: "2026-05-11" },
    { id: "u3", name: "Sophie Laurent", email: "sophie.laurent@example.fr", password: "x", addresses: [{ id: "a3", label: "Home", name: "Sophie Laurent", line1: "22 Rue de Rivoli", city: "Paris", postcode: "75004", country: "France" }], notes: "", tags: ["EU"], active: true, createdAt: "2026-06-20" },
    { id: "u4", name: "Oliver Bennett", email: "oliver.b@example.co.uk", password: "x", addresses: [{ id: "a4", label: "Home", ...addr("Oliver Bennett", "3 Park Row", "Leeds", "LS1 5HD") }], notes: "", tags: [], active: true, createdAt: "2026-08-04" },
  ];
  const mk = (id: string, u: User, items: OrderItem[], status: OrderStatus, date: string): Order => {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal >= 75 ? 0 : 4.95;
    return { id, userId: u.id, email: u.email, name: u.name, items, subtotal, discount: 0, shipping, total: +(subtotal + shipping).toFixed(2),
      address: { name: u.name, line1: u.addresses[0].line1, city: u.addresses[0].city, postcode: u.addresses[0].postcode, country: u.addresses[0].country },
      delivery: "Royal Mail Tracked (2–3 days)", status, paymentStatus: status === "refunded" ? "refunded" : "paid",
      tracking: status === "shipped" || status === "delivered" ? "RM" + id.replace(/\D/g, "") + "GB" : "", notes: "", createdAt: date };
  };
  const orders = [
    mk("GG-10421", users[0], [item("kantha-patchwork-tote"), item("embroidered-mini-pouch", 2)], "delivered", "2026-09-14T10:20:00Z"),
    mk("GG-10433", users[1], [item("banjara-mirror-clutch")], "shipped", "2026-10-02T15:05:00Z"),
    mk("GG-10447", users[2], [item("premium-bamboo-handbag"), item("floral-shoulder-bag")], "processing", "2026-10-21T09:12:00Z"),
    mk("GG-10452", users[3], [item("premium-jute-stripe-tote")], "paid", "2026-11-03T18:40:00Z"),
    mk("GG-10458", users[0], [item("floral-embroidered-jute-tote")], "paid", "2026-11-10T12:00:00Z"),
    mk("GG-10398", users[1], [item("everyday-market-tote")], "refunded", "2026-08-19T11:30:00Z"),
  ];
  return {
    products, collections: seedCollections(), users, orders,
    promos: [
      { code: "HERITAGE10", type: "percent", value: 10, minOrder: 0, expires: "2027-12-31", limit: 0, used: 37, active: true },
      { code: "WELCOME5", type: "fixed", value: 5, minOrder: 40, expires: "2027-06-30", limit: 500, used: 112, active: true },
    ],
    reviews: [
      { id: "r1", productId: "p1", name: "Harriet, Bristol", rating: 5, text: "The embroidery is even lovelier in person. Gets compliments every day.", status: "approved", date: "2026-09-30" },
      { id: "r2", productId: "p3", name: "Imogen, London", rating: 5, text: "Mine has a beautiful mustard square on the front. Truly one of a kind.", status: "approved", date: "2026-10-12" },
      { id: "r3", productId: "p2", name: "Grace, Edinburgh", rating: 4, text: "Sturdy and smart. Fits my laptop easily.", status: "approved", date: "2026-10-18" },
      { id: "r4", productId: "p15", name: "Anonymous", rating: 3, text: "Pretty but smaller than expected.", status: "pending", date: "2026-11-08" },
    ],
    messages: [
      { id: "m1", name: "Lucy Watts", email: "lucy@example.co.uk", subject: "Gift wrapping", body: "Do you offer gift wrapping for the Kantha wristlet?", status: "new", notes: "", date: "2026-11-09" },
    ],
    content: {
      announcement: "Complimentary UK delivery on orders over £75 · Demo store — no real payments",
      heroTagline: "Timeless bags for a beautiful tomorrow",
      heroRight: "Heritage Craftsmanship|Natural Materials|Modern Luxury",
      heroCta: "Shop the collection",
      newsletter: "Letters from the studio: new arrivals, artisan stories and private previews.",
      brandPanel: "Beauty in every detail",
    },
    settings: { storeName: "Gray & Gable London", lowStock: 8, standard: 4.95, express: 9.95, freeOver: 75, taxIncluded: true },
    staff: [
      { id: "s1", name: "Eleanor Gray", email: "admin@grayandgable.co.uk", role: "Owner" },
      { id: "s2", name: "Thomas Gable", email: "thomas@grayandgable.co.uk", role: "Manager" },
      { id: "s3", name: "Priya Shah", email: "priya@grayandgable.co.uk", role: "Staff" },
    ],
    activity: [{ date: "2026-11-10T09:00:00Z", text: "Store seeded with sample data" }],
    cart: [], wishlist: [], sessionUserId: null, adminSignedIn: false, newsletter: [],
  };
}

const KEY = "gg-london-demo-v1";
type Ctx = { db: DB; set: (fn: (d: DB) => DB) => void; log: (text: string) => void; reset: () => void; hydrated: boolean };
const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => seedDB());
  const [hydrated, setHydrated] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDb({ ...seedDB(), ...JSON.parse(raw) });
    } catch { /* ignore corrupt storage */ }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    if (first.current) { first.current = false; return; }
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* quota */ }
  }, [db, hydrated]);
  const set = useCallback((fn: (d: DB) => DB) => setDb((d) => fn(d)), []);
  const log = useCallback((text: string) => setDb((d) => ({ ...d, activity: [{ date: new Date().toISOString(), text }, ...d.activity].slice(0, 200) })), []);
  const reset = useCallback(() => setDb((d) => ({ ...seedDB(), adminSignedIn: d.adminSignedIn })), []);
  return <StoreCtx.Provider value={{ db, set, log, reset, hydrated }}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}

export const uid = (p = "") => p + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);

/** Pure pricing rules — tested in src/test/pricing.test.ts */
export function cartTotals(lines: { price: number; qty: number }[], promo: Promo | undefined, settings: Settings, delivery: "standard" | "express" = "standard") {
  const subtotal = +lines.reduce((s, l) => s + l.price * l.qty, 0).toFixed(2);
  let discount = 0;
  if (promo && promo.active && subtotal >= promo.minOrder) {
    discount = promo.type === "percent" ? subtotal * (promo.value / 100) : Math.min(promo.value, subtotal);
  }
  discount = +discount.toFixed(2);
  const after = subtotal - discount;
  const shipping = subtotal === 0 ? 0 : delivery === "express" ? settings.express : after >= settings.freeOver ? 0 : settings.standard;
  return { subtotal, discount, shipping, total: +(after + shipping).toFixed(2) };
}

export function validatePromo(code: string, promos: Promo[], subtotal: number, today: string): { promo?: Promo; error?: string } {
  const p = promos.find((x) => x.code.toUpperCase() === code.trim().toUpperCase());
  if (!p || !p.active) return { error: "That code isn't valid." };
  if (p.expires && p.expires < today) return { error: "That code has expired." };
  if (p.limit && p.used >= p.limit) return { error: "That code has reached its usage limit." };
  if (subtotal < p.minOrder) return { error: `Spend £${p.minOrder} or more to use this code.` };
  return { promo: p };
}

export function useCart() {
  const { db, set } = useStore();
  const lines = db.cart.map((c) => ({ ...c, product: db.products.find((p) => p.id === c.productId)! })).filter((l) => l.product);
  return {
    lines: lines.map((l) => ({ ...l, price: priceOf(l.product) })),
    count: lines.reduce((s, l) => s + l.qty, 0),
    add: (productId: string, qty = 1) => set((d) => {
      const ex = d.cart.find((c) => c.productId === productId);
      return { ...d, cart: ex ? d.cart.map((c) => (c.productId === productId ? { ...c, qty: c.qty + qty } : c)) : [...d.cart, { productId, qty }] };
    }),
    setQty: (productId: string, qty: number) => set((d) => ({ ...d, cart: qty <= 0 ? d.cart.filter((c) => c.productId !== productId) : d.cart.map((c) => (c.productId === productId ? { ...c, qty } : c)) })),
    clear: () => set((d) => ({ ...d, cart: [] })),
  };
}

export function useWishlist() {
  const { db, set } = useStore();
  return {
    ids: db.wishlist,
    has: (id: string) => db.wishlist.includes(id),
    toggle: (id: string) => set((d) => ({ ...d, wishlist: d.wishlist.includes(id) ? d.wishlist.filter((x) => x !== id) : [...d.wishlist, id] })),
  };
}

export function useSession() {
  const { db } = useStore();
  return db.users.find((u) => u.id === db.sessionUserId) ?? null;
}

export const visibleProducts = (db: DB) => db.products.filter((p) => p.status === "active");
