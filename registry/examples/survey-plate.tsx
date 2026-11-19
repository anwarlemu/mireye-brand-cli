"use client";

import { SurveyPlate } from "@/components/blocks/survey-plate";

export function Preview() {
  return <SurveyPlate className="aspect-video w-full max-sm:aspect-4/3" />;
}

export function Plain() {
  return <SurveyPlate className="h-64 w-full" columns={8} rows={4} marker={null} caption="32.7767, -96.7970" parcels={[{ x: 30, y: 30, w: 40, h: 40, state: "selected", label: "113-020-41" }]} />;
}
