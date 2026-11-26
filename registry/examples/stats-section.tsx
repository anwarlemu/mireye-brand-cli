import { StatsSection } from "@/components/blocks/stats-section";

export function Preview() {
  return <StatsSection closing />;
}

export function WithTitle() {
  return <StatsSection closing label="Coverage" title="One request covers the country." stats={[{ value: "3,143", unit: "Counties", description: "Every county in the U.S." }, { value: "155M", unit: "Parcels", description: "With owners and lines." }]} />;
}
