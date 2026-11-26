"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Preview() {
  const [state, setState] = React.useState<string>();
  return (
    <div className="grid w-full max-w-80 gap-2">
      <Label id="state-label">State</Label>
      <Select value={state} onValueChange={setState}>
        <SelectTrigger aria-labelledby="state-label">
          <SelectValue placeholder="Any state" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>West</SelectLabel>
            <SelectItem value="or">Oregon</SelectItem>
            <SelectItem value="wa">Washington</SelectItem>
            <SelectItem value="nv">Nevada</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>South</SelectLabel>
            <SelectItem value="tx">Texas</SelectItem>
            <SelectItem value="ga">Georgia</SelectItem>
            <SelectItem value="az" disabled>
              Arizona (no data yet)
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export function Sizes() {
  return (
    <form className="flex w-full max-w-120 flex-wrap items-center gap-3" onSubmit={(e) => e.preventDefault()}>
      <Select defaultValue="345">
        <SelectTrigger aria-label="Minimum voltage" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="115">115 kV</SelectItem>
          <SelectItem value="230">230 kV</SelectItem>
          <SelectItem value="345">345 kV</SelectItem>
          <SelectItem value="500">500 kV</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="fit">
        <SelectTrigger size="sm" aria-label="Sort parcels" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fit">Best fit</SelectItem>
          <SelectItem value="size">Largest first</SelectItem>
          <SelectItem value="distance">Nearest a substation</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" arrow>
        Find sites
      </Button>
    </form>
  );
}

export function States() {
  return (
    <div className="grid w-full max-w-80 gap-4">
      <Select defaultValue="or" disabled>
        <SelectTrigger aria-label="Locked state">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="or">Oregon</SelectItem>
        </SelectContent>
      </Select>
      <div className="grid gap-2">
        <Select>
          <SelectTrigger aria-label="Required zoning" aria-invalid aria-describedby="zoning-error">
            <SelectValue placeholder="Choose a zoning" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="i1">I-1 Light industrial</SelectItem>
            <SelectItem value="i2">I-2 Industrial</SelectItem>
          </SelectContent>
        </Select>
        <p id="zoning-error" className="m-0 text-caption leading-line-caption text-danger">
          Choose the zoning the site needs.
        </p>
      </div>
    </div>
  );
}
