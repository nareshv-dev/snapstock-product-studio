import { createFileRoute } from "@tanstack/react-router";
import { PageHeading } from "@/components/site/ornaments";
import { Prose } from "@/components/site/prose";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: seo("Privacy Policy", "How Gray & Gable London handles your personal data.") }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeading title="Privacy Policy" />
      <Prose>
        <p>Last updated 1 November 2026. Gray &amp; Gable London (“we”) respects your privacy and complies with the UK GDPR and Data Protection Act 2018.</p>
        <h2>What we collect</h2><ul><li>Contact and delivery details you provide at checkout</li><li>Order history and account preferences</li><li>Newsletter sign-ups, only with your consent</li></ul>
        <h2>How we use it</h2><p>To fulfil orders, provide customer care and, where you opt in, send our studio letters. We never sell your data.</p>
        <h2>Your rights</h2><p>You may request access, correction or deletion of your data at any time by emailing privacy@grayandgable.co.uk.</p>
        <h2>This demo</h2><p>On this demonstration site, all information is stored only in your own browser and is never sent to a server.</p>
      </Prose>
    </>
  );
}
