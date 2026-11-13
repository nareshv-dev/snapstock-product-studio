import { createFileRoute } from "@tanstack/react-router";
import { PageHeading } from "@/components/site/ornaments";
import { Prose } from "@/components/site/prose";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: seo("Terms & Conditions", "The terms that apply to purchases from Gray & Gable London.") }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeading title="Terms & Conditions" />
      <Prose>
        <p>These terms apply to orders placed with Gray &amp; Gable London, 12 Marylebone Lane, London W1U 2NE.</p>
        <h2>Orders</h2><p>Your order is an offer to buy. A contract is formed when we dispatch your items. Prices are in pounds sterling and include VAT.</p>
        <h2>Handmade goods</h2><p>Each bag is handmade; small variations in colour, pattern and stitching are part of its character and are not defects.</p>
        <h2>Cancellations</h2><p>Under the Consumer Contracts Regulations you may cancel within 14 days of delivery. We offer an extended 30-day return window.</p>
        <h2>Demo notice</h2><p>This site is a demonstration. No goods are sold and no payments are processed.</p>
      </Prose>
    </>
  );
}
