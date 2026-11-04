"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnitSelect, type Unit } from "@/components/ui/unit-select";

type AreaUnit = "ac" | "ha" | "mi2" | "ft2";
const UNITS: Unit<AreaUnit>[] = [
  { value: "ac", label: "Acres", short: "ac" },
  { value: "ha", label: "Hectares", short: "ha" },
  { value: "mi2", label: "Square miles", short: "mi²" },
  { value: "ft2", label: "Square feet", short: "ft²" },
];
const PER_ACRE: Record<AreaUnit, number> = { ac: 1, ha: 0.404686, mi2: 0.0015625, ft2: 43560 };
const DECIMALS: Record<AreaUnit, number> = { ac: 1, ha: 1, mi2: 3, ft2: 0 };

// Changing the unit converts the number, so the size stays the same: 41.2 ac becomes 16.7 ha.
export function Preview() {
  const [unit, setUnit] = React.useState<AreaUnit>("ac");
  const [size, setSize] = React.useState("41.2");
  const change = (next: AreaUnit) => {
    const n = Number.parseFloat(size);
    if (!Number.isNaN(n)) setSize(((n / PER_ACRE[unit]) * PER_ACRE[next]).toFixed(DECIMALS[next]));
    setUnit(next);
  };
  return (
    <div className="grid w-full max-w-96 gap-2">
      <Label htmlFor="unit-size">Parcel size</Label>
      <Input id="unit-size" inputMode="decimal" value={size} onChange={(e) => setSize(e.target.value)} unit={<UnitSelect label="Area unit" value={unit} units={UNITS} onValueChange={change} />} />
    </div>
  );
}
