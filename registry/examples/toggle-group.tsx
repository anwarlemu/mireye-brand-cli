"use client";

import * as React from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function Preview() {
  const [view, setView] = React.useState("map");
  return (
    <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v)} aria-label="View">
      <ToggleGroupItem value="map">Map</ToggleGroupItem>
      <ToggleGroupItem value="list">List</ToggleGroupItem>
      <ToggleGroupItem value="compare">Compare</ToggleGroupItem>
    </ToggleGroup>
  );
}

export function Outline() {
  return (
    <ToggleGroup type="multiple" variant="outline" spacing={0} defaultValue={["parcels"]} aria-label="Layers">
      <ToggleGroupItem value="parcels">Parcels</ToggleGroupItem>
      <ToggleGroupItem value="substations">Substations</ToggleGroupItem>
      <ToggleGroupItem value="wetlands">Wetlands</ToggleGroupItem>
    </ToggleGroup>
  );
}

export function Sizes() {
  return (
    <div className="grid gap-3">
      <ToggleGroup type="single" size="sm" defaultValue="ac" aria-label="Area unit">
        <ToggleGroupItem value="ac">ac</ToggleGroupItem>
        <ToggleGroupItem value="ha">ha</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" size="lg" defaultValue="30" aria-label="Distance">
        <ToggleGroupItem value="10">10 mi</ToggleGroupItem>
        <ToggleGroupItem value="30">30 mi</ToggleGroupItem>
        <ToggleGroupItem value="60">60 mi</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
