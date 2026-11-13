import { createFileRoute } from "@tanstack/react-router";
import { PageHeading } from "@/components/site/ornaments";
import { Prose } from "@/components/site/prose";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/shipping-returns")({
  head: () => ({ meta: seo("Shipping & Returns", "UK and EU delivery options, costs and our 30-day returns policy.") }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeading title="Shipping & Returns" />
      <Prose>
        <h2>UK delivery</h2><ul><li>Royal Mail Tracked, 2–3 working days — £4.95, free over £75</li><li>Express Next Day (order by 2pm) — £9.95</li></ul>
        <h2>EU delivery</h2><ul><li>EU Tracked, 4–7 working days — £9.95</li><li>Duties and taxes prepaid, so no surprise charges</li></ul>
        <h2>Returns</h2><p>Return unused items in original packaging within 30 days for a full refund. Start a return from your account or email hello@grayandgable.co.uk. UK returns are free with our prepaid label.</p>
        <h2>Refunds</h2><p>Refunds are issued to the original payment method within 5 working days of your return arriving at our studio.</p>
      </Prose>
    </>
  );
}
