"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Range } from "@/components/ui/range";

// The Filled row from Figma: the field and the ruler share one value. Typing moves the handle; dragging, a press or
// the arrow keys write the value back into the field. Hover the ruler to see the ticks rise around the pointer.
export function Preview() {
  const [text, setText] = React.useState("41.2");
  const n = Number.parseFloat(text);
  const value = Number.isNaN(n) ? 40 : n;
  return (
    <div className="grid w-full max-w-96 gap-2">
      <Label htmlFor="range-size">Parcel size</Label>
      <Input id="range-size" unit="ac" inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} />
      <Range className="mt-2" min={40} max={120} step={0.1} value={value} onValueChange={(v) => setText(String(v))} helper="Within 40 to 120 ac" aria-label="Parcel size" />
    </div>
  );
}

export function Bare() {
  return <Range className="w-full max-w-96" min={0} max={10} defaultValue={2} aria-label="Distance to a substation in miles" helper="Up to 2 miles from a substation" />;
}
