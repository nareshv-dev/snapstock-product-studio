import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeading } from "@/components/site/ornaments";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: seo("FAQ", "Answers about our materials, delivery, returns and caring for your bag.") }),
  component: Faq,
});

const qs = [
  ["Are your bags really handmade?", "Yes. Every bag is cut, stitched and embroidered by hand in small artisan workshops, then inspected at our London studio."],
  ["What is kantha?", "Kantha is a traditional running-stitch quilting technique that layers and stitches cotton cloth, giving each piece its rippled texture and unique pattern."],
  ["What is Banjara mirror-work?", "A centuries-old embroidery style in which small mirrors are stitched into vibrant thread patterns."],
  ["How do I care for jute?", "Keep it dry, spot clean with a damp cloth and store it stuffed in its dust bag to keep its shape."],
  ["Do you ship to the EU?", "Yes — EU Tracked delivery takes 4–7 working days with duties prepaid."],
  ["Can I return a bag?", "Of course. Unused items can be returned within 30 days for a full refund."],
  ["Do you offer gift wrapping?", "Every order arrives in a cotton dust bag and tissue; add a gift note at checkout in the real store."],
  ["Is this a real shop?", "This is a demonstration storefront. Products, orders and payments are simulated."],
];

function Faq() {
  return (
    <>
      <PageHeading title="Frequently Asked Questions" />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Accordion type="single" collapsible>
          {qs.map(([q, a], i) => (
            <AccordionItem key={i} value={String(i)}>
              <AccordionTrigger className="text-left font-serif text-lg">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
