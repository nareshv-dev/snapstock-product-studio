# Gray & Gable London — Heritage Handbag Store

Front-end-only shop that matches your reference image: parchment background, botanical line art in the corners, antique gold accents, elegant serif lettering and warm product photos. Works well on phones. Prices in GBP only.

## Look and feel
- Colours: parchment #F3EBDD, ivory #FAF5EC, taupe #C9B79C, antique gold #A8834A, espresso text #2E2620, charcoal plaque #3A3633.
- Fonts: Cormorant Garamond for headings, with spaced capitals. Karla for body text.
- Details from the image: framed product tiles on beige backdrops, a small icon with the name and price under each bag, fleur-de-lis dividers, botanical sprigs, a London skyline drawing and the "GG" plaque logo.
- The home page copies the image layout: tagline on the left, GG plaque in the centre and the three heritage lines on the right. Below that comes the bag grid (4 / 5 / 3 plus a brand panel), which becomes 2 columns on phones.

## Products (18, using your names and prices)
Totes (5), Crossbody & Shoulder (5), Statement (4), Clutches & Small Bags (4).
Collections: New Arrivals, Best Sellers, Gifts Under £30, Everyday Essentials, Occasion Bags, Limited Edition Artisans' Collection.

## Images
- Brand art: GG plaque logo, botanical corner sprigs, London skyline and an artisan photo for the brand story.
- Products: 4 photos per bag (front, angled, close-up detail, styled), 72 in total. Every photo uses the same warm light and marble-and-beige setting as your reference.
- Order: the main photo of every bag comes first, so the whole shop works early. The extra gallery photos follow in batches.

## Pages
Home, Shop (filters, sorting, load more), Collections, Product detail, Search, Wishlist, Cart (promo code HERITAGE10, UK delivery estimate), Checkout (simulated card with validation, "Payment successful" and a mock order number), Sign up / Login / Account (addresses, orders, order detail, cancel order), About, Contact, FAQ, Shipping & Returns, Privacy, Terms.

The cart, wishlist, demo account and orders are saved in the browser, so they stay after a refresh. All demo data is clearly labelled, and no real payments are taken.

## Navigation
Announcement bar, then a top bar with the GG logo, links to the shop sections (Totes, Crossbody, Statement, Clutches, Collections, About), search, wishlist, account and cart with an item count. On phones the links fold into a slide-out menu.

## Admin panel (/admin, demo mode)
A separate admin area with its own sidebar and a clear "Demo mode" label. Every change is saved in the browser and shows up in the shop right away.
- Dashboard: sales, orders, customers, stock value, a sales chart, top sellers, low-stock alerts and recent orders.
- Products: add, edit, duplicate, archive and delete. Each product has a price, sale price, stock, photos (upload or choose existing), category, collection, tags, details, status, and featured / new / best-seller flags. Bulk actions and a mock CSV export.
- Collections and categories: add, edit, reorder and feature them on the home page.
- Inventory: stock levels, low-stock threshold and stock adjustments with a reason.
- Orders: filters, order detail, status updates, tracking number, notes, cancel or refund, and a printable invoice.
- Customers: profiles, order history, total spend and notes.
- Discounts: percentage or fixed promo codes with expiry, usage limits and minimum spend. These work at checkout.
- Reports: sales by date, product and collection, plus a CSV export.
- Storefront content: hero text, announcement bar and featured items.
- Reviews and messages: approve or hide reviews, and handle contact form messages.
- Settings: store settings, staff roles, an activity log, and a button to reset the sample data.
- Demo admin login: admin@grayandgable.co.uk / admin123.

## Technical
- One TanStack route per page, with the shared header and footer in the root layout.
- One catalogue module for products, plus React context and localStorage stores.
- oklch tokens in styles.css, restyled shadcn components, sonner toasts and a head() on every route.
