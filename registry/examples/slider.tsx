"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function Preview() {
  const [value, setValue] = React.useState([30]);
  return (
    <div className="grid w-full max-w-96 gap-3">
      <div className="flex items-baseline justify-between">
        <Label id="radius-label">Search radius</Label>
        <span className="font-mono text-caption text-fg">{value[0]} mi</span>
      </div>
      <Slider value={value} onValueChange={setValue} min={5} max={100} aria-labelledby="radius-label" />
    </div>
  );
}

export function Range() {
  const [value, setValue] = React.useState([40, 120]);
  return (
    <div className="grid w-full max-w-96 gap-3">
      <div className="flex items-baseline justify-between">
        <Label id="acres-label">Parcel size</Label>
        <span className="font-mono text-caption text-fg">
          {value[0]} to {value[1]} ac
        </span>
      </div>
      <Slider value={value} onValueChange={setValue} min={0} max={200} aria-labelledby="acres-label" aria-label={["Minimum size", "Maximum size"]} />
    </div>
  );
}

export function States() {
  return (
    <div className="flex w-full max-w-96 items-center gap-8">
      <Slider defaultValue={[60]} disabled aria-label="Locked radius" />
      <Slider defaultValue={[40]} orientation="vertical" aria-label="Opacity" className="h-32" />
    </div>
  );
}
