// Seed catalogue. Admin edits are layered on top via the store (localStorage).
const imgs = import.meta.glob("/src/assets/products/*.jpg", { eager: true, import: "default" }) as Record<string, string>;
const img = (slug: string, v = "") => imgs[`/src/assets/products/${slug}${v}.jpg`] ?? "";

export type Category = "totes" | "crossbody" | "statement" | "clutches";
export type Status = "active" | "draft" | "archived";
export type Product = {
  id: string; slug: string; name: string; sku: string; category: Category;
  price: number; salePrice?: number; cost: number; stock: number;
  colour: string; materials: string; dimensions: string; care: string;
  description: string; images: string[]; collections: string[]; tags: string[];
  icon: string; status: Status; featured: boolean; isNew: boolean; bestSeller: boolean;
  createdAt: string;
};
export type Collection = { slug: string; name: string; description: string; image: string; visible: boolean; featured: boolean };

export const CATEGORIES: { slug: Category; name: string }[] = [
  { slug: "totes", name: "Totes" },
  { slug: "crossbody", name: "Crossbody & Shoulder" },
  { slug: "statement", name: "Statement Bags" },
  { slug: "clutches", name: "Clutches & Small Bags" },
];

type Seed = [string, string, Category, number, string, string, string, string[], string, number];
// slug, name, category, price, colour, materials, description, collections, icon, stock
const seeds: Seed[] = [
  ["floral-embroidered-jute-tote","Floral Embroidered Jute Tote","totes",39.99,"Natural","Jute, cotton embroidery thread","Hand-embroidered folk florals bloom across a sturdy natural jute body, finished with soft rope handles.",["best-sellers","everyday-essentials"],"leaf",24],
  ["premium-jute-stripe-tote","Premium Jute Stripe Tote","totes",44.99,"Navy","Jute, vegetable-tanned leather","A structured jute tote with a woven navy stripe and supple tan leather handles — our London commuter favourite.",["best-sellers","everyday-essentials"],"leaf",18],
  ["kantha-patchwork-tote","Kantha Patchwork Tote","totes",54.99,"Multicolour","Upcycled cotton kantha, leather","Each tote is pieced from hand-quilted kantha squares, so no two are ever quite alike.",["limited-edition","best-sellers"],"arch",9],
  ["everyday-market-tote","Everyday Market Tote","totes",34.99,"Cream","Cotton canvas, jute, cotton rope","A roomy canvas-and-jute tote for markets, libraries and long weekends.",["everyday-essentials","new-arrivals"],"leaf",40],
  ["reversible-printed-tote","Reversible Printed Tote","totes",42.99,"Indigo","Block-printed cotton","Two block-printed patterns in one: indigo florals outside, ochre blooms within.",["new-arrivals"],"flower",22],
  ["kantha-crossbody-bag","Kantha Crossbody Bag","crossbody",49.99,"Multicolour","Cotton kantha, leather","A saddle-shape crossbody in striped hand-quilted kantha with an adjustable leather strap.",["best-sellers","limited-edition"],"arch",12],
  ["embroidered-crossbody-bag","Embroidered Crossbody Bag","crossbody",39.99,"Cream","Cotton canvas, leather","A softly rounded crossbody embroidered with a full bouquet of folk flowers.",["everyday-essentials"],"bag",16],
  ["floral-shoulder-bag","Floral Shoulder Bag","crossbody",44.99,"Cream","Cotton canvas, leather trim","A crescent shoulder bag covered in delicate wildflower embroidery.",["new-arrivals","occasion-bags"],"flower",14],
  ["banjara-mirror-sling","Banjara Mirror-Work Sling","crossbody",44.99,"Red","Cotton, mirror-work, wool tassels","Traditional Banjara embroidery with hand-set mirrors and a fringe of colourful tassels.",["occasion-bags"],"circle",7],
  ["mini-everyday-crossbody","Mini Everyday Crossbody","crossbody",34.99,"Natural","Crocheted jute, leather","Just big enough for phone, keys and cards, in hand-crocheted jute with a leather flap.",["everyday-essentials","new-arrivals"],"bag",30],
  ["banjara-statement-bag","Banjara Statement Bag","statement",59.99,"Red","Cotton, mirror-work, leather","Our boldest piece: a generous hobo covered in mirror-work, beading and tassels.",["occasion-bags","limited-edition"],"circle",5],
  ["bamboo-handle-handbag","Bamboo-Handle Handbag","statement",49.99,"Natural","Jute, bamboo, cotton embroidery","A structured jute handbag with curved bamboo handles and a garden of embroidered blooms.",["best-sellers","occasion-bags"],"sprig",11],
  ["premium-bamboo-handbag","Premium Bamboo Handbag","statement",59.99,"Natural","Seagrass weave, bamboo, leather","Tightly woven seagrass with leather corners and polished bamboo handles.",["limited-edition"],"sprig",3],
  ["patchwork-weekend-bag","Patchwork Weekend Bag","statement",64.99,"Multicolour","Cotton kantha, leather","A weekender pieced from vintage kantha patches, built for slow trains to the coast.",["limited-edition","new-arrivals"],"arch",6],
  ["banjara-mirror-clutch","Banjara Mirror-Work Clutch","clutches",34.99,"Red","Cotton, mirror-work","An envelope clutch glinting with hand-set mirrors, finished with a silk-look tassel.",["occasion-bags"],"circle",15],
  ["premium-embroidered-clutch","Premium Embroidered Clutch","clutches",39.99,"Cream","Cotton canvas, cotton thread","A cream envelope clutch with dense satin-stitch florals and a cream tassel.",["occasion-bags","best-sellers"],"star",13],
  ["kantha-wristlet-pouch","Kantha Wristlet Pouch","clutches",24.99,"Multicolour","Cotton kantha","A zip wristlet in striped kantha — a perfect small gift.",["gifts-under-30"],"arch",0],
  ["embroidered-mini-pouch","Embroidered Mini Pouch","clutches",19.99,"Natural","Jute, cotton thread","A tiny jute pouch embroidered with a meadow of wildflowers.",["gifts-under-30","new-arrivals"],"flower",50],
];

const dims: Record<Category, string> = {
  totes: "W 38 × H 32 × D 14 cm, handle drop 22 cm",
  crossbody: "W 24 × H 20 × D 8 cm, strap 110–130 cm",
  statement: "W 34 × H 28 × D 14 cm, handle drop 14 cm",
  clutches: "W 22 × H 13 × D 3 cm",
};

export function seedProducts(): Product[] {
  return seeds.map(([slug, name, category, price, colour, materials, description, collections, icon, stock], i) => ({
    id: `p${i + 1}`, slug, name, sku: `GG-${category.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
    category, price, cost: Math.round(price * 0.38 * 100) / 100, stock, colour, materials, dimensions: dims[category],
    care: "Spot clean with a damp cloth. Store stuffed in the dust bag away from direct sunlight.",
    description, images: [img(slug), img(slug, "--angle"), img(slug, "--detail")],
    collections: price < 30 ? Array.from(new Set([...collections, "gifts-under-30"])) : collections,
    tags: [], icon, status: "active", featured: i < 12, isNew: collections.includes("new-arrivals"),
    bestSeller: collections.includes("best-sellers"), createdAt: `2026-0${(i % 9) + 1}-1${i % 9}`,
  }));
}

export function seedCollections(): Collection[] {
  return [
    ["new-arrivals", "New Arrivals", "Freshly stitched pieces from our artisan studios.", "reversible-printed-tote"],
    ["best-sellers", "Best Sellers", "The bags our customers come back for.", "floral-embroidered-jute-tote"],
    ["gifts-under-30", "Gifts Under £30", "Small treasures, thoughtfully made.", "embroidered-mini-pouch"],
    ["everyday-essentials", "Everyday Essentials", "Hard-wearing companions for daily life.", "premium-jute-stripe-tote"],
    ["occasion-bags", "Occasion Bags", "Mirror-work and embroidery for evenings out.", "banjara-mirror-clutch"],
    ["limited-edition", "Limited Edition Artisans' Collection", "Small-batch pieces, signed by their makers.", "patchwork-weekend-bag"],
  ].map(([slug, name, description, s], i) => ({ slug, name, description, image: img(s), visible: true, featured: i < 4 }));
}

export const gbp = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
export const priceOf = (p: Product) => (p.salePrice && p.salePrice < p.price ? p.salePrice : p.price);
