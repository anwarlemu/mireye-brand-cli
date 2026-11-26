"use client";

import { AreaChart, BarChart, type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, LineChart, PieChart } from "@/components/ui/chart";

const SITES = [
  { county: "Ellis", strong: 14, moderate: 9 },
  { county: "Navarro", strong: 8, moderate: 12 },
  { county: "Kaufman", strong: 6, moderate: 7 },
  { county: "Johnson", strong: 11, moderate: 5 },
  { county: "Hill", strong: 3, moderate: 8 },
  { county: "Henderson", strong: 5, moderate: 4 },
];

const config = {
  strong: { label: "Strong fit" },
  moderate: { label: "Moderate fit" },
} satisfies ChartConfig;

const short = (v: string) => v.slice(0, 4);

export function Preview() {
  return (
    <ChartContainer config={config} className="aspect-auto h-80">
      <BarChart data={SITES} index="county" tickFormatter={short} aria-label="Sites by county and fit" />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
    </ChartContainer>
  );
}

const PROFILE = [
  { mile: "0", elevation: 398 },
  { mile: "0.2", elevation: 404 },
  { mile: "0.4", elevation: 411 },
  { mile: "0.6", elevation: 409 },
  { mile: "0.8", elevation: 416 },
  { mile: "1.0", elevation: 421 },
  { mile: "1.2", elevation: 418 },
  { mile: "1.4", elevation: 412 },
];

const elevationConfig = { elevation: { label: "Elevation, ft" } } satisfies ChartConfig;

export function Line() {
  return (
    <ChartContainer config={elevationConfig} className="aspect-auto h-80">
      <LineChart data={PROFILE} index="mile" showYAxis dots aria-label="Elevation along the parcel, south to north" />
      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
      <ChartLegend content={<ChartLegendContent />} />
    </ChartContainer>
  );
}

const QUEUE = [
  { year: "2021", solar: 42, storage: 8 },
  { year: "2022", solar: 58, storage: 19 },
  { year: "2023", solar: 71, storage: 34 },
  { year: "2024", solar: 66, storage: 52 },
  { year: "2025", solar: 80, storage: 61 },
  { year: "2026", solar: 92, storage: 77 },
];

const queueConfig = { solar: { label: "Solar" }, storage: { label: "Storage" } } satisfies ChartConfig;

export function Area() {
  return (
    <ChartContainer config={queueConfig} className="aspect-auto h-80">
      <AreaChart data={QUEUE} index="year" stacked aria-label="Interconnection requests per year, stacked by type" />
      <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
      <ChartLegend content={<ChartLegendContent />} />
    </ChartContainer>
  );
}

const LAND_USE = [
  { use: "cropland", acres: 128.4 },
  { use: "pasture", acres: 61.0 },
  { use: "woodland", acres: 23.2 },
];

const landConfig = {
  cropland: { label: "Cropland", color: "var(--ds-color-chart-series-1)" },
  pasture: { label: "Pasture", color: "var(--ds-color-chart-series-3)" },
  woodland: { label: "Woodland", color: "var(--ds-color-chart-series-4)" },
} satisfies ChartConfig;

export function Pie() {
  return (
    <ChartContainer config={landConfig} className="mx-auto aspect-square max-h-72">
      <PieChart data={LAND_USE} index="use" value="acres" aria-label="Land use on Ellis County site 14, in acres" />
      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
      <ChartLegend content={<ChartLegendContent />} />
    </ChartContainer>
  );
}
