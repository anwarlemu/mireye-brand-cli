"use client";

import * as React from "react";
import { CompareMatrix, type CompareCell, type CompareRequirement, type CompareSite } from "@/components/ui/compare-matrix";
import { NONE_ON_RECORD } from "@/lib/empty-value";

// Sites side by side against one buy box. North Tract fails the floodplain requirement, so its cell fills Fog with a
// Forest bar. Add site screens the next lead into the table (900ms); Remove takes a site out. Readings nobody took
// stay "Not screened".
const LEADS: { site: CompareSite; results: Record<string, CompareCell> }[] = [
  {
    site: { id: "acme-east", name: "Acme East Tract", detail: "FM 875, Ellis County", fit: 87 },
    results: {
      acreage: { result: "pass", value: "487.9 ac", source: 1 },
      floodplain: { result: "pass", value: "Zone X", source: 3 },
      distance: { result: "pass", value: "1.42 mi", source: 2 },
      voltage: { result: "pass", value: "345 kV", source: 2 },
      fiber: { result: "unknown" },
    },
  },
  {
    site: { id: "north", name: "North Tract", detail: "FM 1446, Ellis County", fit: 58 },
    results: {
      acreage: { result: "pass", value: "328.7 ac", source: 1 },
      floodplain: { result: "fail", value: "Zone AE", source: 3 },
      distance: { result: "pass", value: "0.24 mi", source: 2 },
      voltage: { result: "pass", value: "138 kV", source: 2 },
      fiber: { result: "pass", value: "0.8 mi" },
    },
  },
  {
    site: { id: "river", name: "River Bottom Place", detail: "Sims Road, Ellis County", fit: 66 },
    results: {
      acreage: { result: "pass", value: "283.0 ac", source: 1 },
      floodplain: { result: "unknown" },
      distance: { result: "pass", value: "3.10 mi", source: 2 },
      voltage: { result: "pass", value: "230 kV", source: 2 },
      fiber: { result: "unknown" },
    },
  },
  {
    site: { id: "ridge", name: "Ridge Section", detail: "FM 660, Ellis County", fit: 92 },
    results: {
      acreage: { result: "pass", value: "932.9 ac", source: 1 },
      floodplain: { result: "pass", value: "Zone X", source: 3 },
      distance: { result: "pass", value: "2.79 mi", source: 2 },
      voltage: { result: "pass", value: "345 kV", source: 2 },
      fiber: { result: "pass", value: "1.2 mi" },
    },
  },
];

const FIELDS = [
  { id: "acreage", field: "Acreage", requirement: "≥ 200 ac" },
  { id: "floodplain", field: "Floodplain", requirement: "Outside" },
  { id: "distance", field: "Transmission", requirement: "≤ 5 mi" },
  { id: "voltage", field: "Voltage", requirement: "≥ 138 kV" },
  { id: "fiber", field: "Fiber nearby", requirement: "Reported", kind: 20 },
] as const;

const REQUIREMENTS: CompareRequirement[] = FIELDS.map((f) => ({
  id: f.id,
  field: f.field,
  requirement: f.requirement,
  kind: "kind" in f ? f.kind : "must",
  results: Object.fromEntries(LEADS.map((l) => [l.site.id, l.results[f.id]])),
}));

export function Preview() {
  const [ids, setIds] = React.useState(["acme-east", "north"]);
  const [screening, setScreening] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!screening) return;
    // ds-latency: the demo plays a run on a clock; no input waits on this timer.
    const id = window.setTimeout(() => setScreening(null), 900);
    return () => window.clearTimeout(id);
  }, [screening]);
  const sites = ids.map((id) => ({ ...LEADS.find((l) => l.site.id === id)!.site, loading: screening === id }));
  return (
    <CompareMatrix
      className="w-full"
      sites={sites}
      requirements={REQUIREMENTS}
      notes={[{ id: "signals", label: "County signals", values: { "acme-east": { value: "Rezoning hearing", detail: "Mar 12" } }, empty: NONE_ON_RECORD }]}
      market="Ellis County"
      showTally
      maxSites={4}
      onRemoveSite={(id) => setIds((s) => s.filter((x) => x !== id))}
      onAddSite={() => {
        const next = LEADS.find((l) => !ids.includes(l.site.id));
        if (!next) return;
        setIds((s) => [...s, next.site.id]);
        setScreening(next.site.id);
      }}
    />
  );
}

// Three sites, still, with the floodplain row under discussion: the other rows step back.
export function ActiveRow() {
  return (
    <CompareMatrix
      className="w-full"
      sites={LEADS.slice(0, 3).map((l) => l.site)}
      requirements={REQUIREMENTS}
      market="Ellis County"
      activeRequirement="floodplain"
    />
  );
}
