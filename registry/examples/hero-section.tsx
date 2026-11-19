import { HeroSection } from "@/components/blocks/hero-section";

export function Preview() {
  return <HeroSection />;
}

export function Centered() {
  return <HeroSection layout="center" notice={null} title="Ask anything about any U.S. place." description="Your agent asks in plain words; Mireye answers with cited values from county, utility and federal records." />;
}
