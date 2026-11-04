"use client";

import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";

const LAYERS = ["Parcels", "Substations", "Transmission lines"];

export function Preview() {
  return (
    <div className="grid gap-3">
      <Checkbox defaultChecked>Exclude floodplain</Checkbox>
      <Checkbox>Exclude wetlands</Checkbox>
      <Checkbox>Exclude protected land</Checkbox>
    </div>
  );
}

// "Show all" is mixed while some layers are on.
export function Group() {
  const [on, setOn] = React.useState<string[]>(["Parcels"]);
  const all = on.length === LAYERS.length ? true : on.length ? "indeterminate" : false;
  return (
    <div className="grid gap-3">
      <Checkbox checked={all} onCheckedChange={(c) => setOn(c === true ? LAYERS : [])}>
        Show all layers
      </Checkbox>
      <div className="grid gap-3 pl-7">
        {LAYERS.map((l) => (
          <Checkbox key={l} checked={on.includes(l)} onCheckedChange={(c) => setOn((v) => (c === true ? [...v, l] : v.filter((x) => x !== l)))}>
            {l}
          </Checkbox>
        ))}
      </div>
    </div>
  );
}

export function States() {
  return (
    <div className="grid gap-3">
      <Checkbox disabled>Zoning (no data)</Checkbox>
      <Checkbox disabled defaultChecked>
        County boundary
      </Checkbox>
      <Checkbox aria-invalid>Accept the data terms</Checkbox>
    </div>
  );
}
