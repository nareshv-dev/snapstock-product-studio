<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Storefront and admin are front-end only: all data lives in one localStorage-backed store (`src/lib/store.tsx`), seeded from `src/lib/catalog.ts`. Why: the brief is a demo with simulated payments and no backend.
- Pricing rules (promo, delivery, totals) are pure functions in the store and covered by `src/test/pricing.test.ts`. Why: they're used by the cart, the checkout and the tests.
- The storefront header and footer are skipped for `/admin*` inside `__root.tsx` Shell. Why: the admin has its own sidebar layout.
- tsconfig strict extras (noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitReturns, noPropertyAccessFromIndexSignature) are off. Why: they produced noise across the large demo code without catching real bugs.
- PDF receipts are built in the browser with pdf-lib (lazy-imported in src/lib/receipt.ts) and prebuilt before the click. Why: no backend, and phones drop downloads after a slow await.
