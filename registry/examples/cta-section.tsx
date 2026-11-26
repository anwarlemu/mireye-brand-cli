import { CtaSection } from "@/components/blocks/cta-section";

export function Preview() {
  return <CtaSection closing />;
}

export function Light() {
  return <CtaSection closing tone="light" label="Platform" title="See your next site before you visit it." description="Book a call and we will screen one county with you." primary={{ label: "Book a call", href: "#contact" }} secondary={{ label: "Read the docs", href: "#docs" }} />;
}
