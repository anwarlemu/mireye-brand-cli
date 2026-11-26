"use client";

import * as React from "react";
import { CheckIcon as CheckGlyph, CopyIcon, XIcon } from "@phosphor-icons/react/ssr";

import { ParcelIcon } from "@/components/icons/parcel-icon";
import { Dial } from "@/components/ui/dial";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";

// The search row from Figma: the parcel glyph 12px before the text.
export function Preview() {
  return (
    <div className="grid w-full max-w-110 gap-2">
      <Label htmlFor="location-search">Location</Label>
      <InputGroup>
        <InputGroupAddon>
          <ParcelIcon size={10} className="size-2.5 text-fg" />
        </InputGroupAddon>
        <InputGroupInput id="location-search" type="search" placeholder="Search any U.S. location" />
        <InputGroupAddon align="inline-end">
          <Kbd>/</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

export function Units() {
  return (
    <div className="grid w-full max-w-110 gap-4">
      <InputGroup>
        <InputGroupInput aria-label="Minimum voltage" defaultValue="345" inputMode="numeric" />
        <InputGroupAddon align="inline-end">kV</InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon variant="segment">APN</InputGroupAddon>
        <InputGroupInput aria-label="Parcel number" defaultValue="041-220-17" className="font-mono" />
      </InputGroup>
      <InputGroup>
        <InputGroupInput aria-label="Distance to the nearest substation" defaultValue="2.4" inputMode="decimal" />
        <InputGroupAddon align="inline-end" variant="segment">
          miles to a substation
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

// While the parent checks a parcel number, the Dial turns at the end of the field; then a check or a brick x.
export function Checking() {
  const [value, setValue] = React.useState("041-220-17");
  const [copied, setCopied] = React.useState(false);
  const valid = /^\d{3}-\d{3}-\d{2}$/.test(value);
  return (
    <div className="grid w-full max-w-110 gap-4">
      <InputGroup>
        <InputGroupInput aria-label="Parcel being checked" defaultValue="041-220-1" />
        <InputGroupAddon align="inline-end">
          <Dial size={24} aria-label="Checking the parcel" />
        </InputGroupAddon>
      </InputGroup>
      <div className="grid gap-2">
        <InputGroup>
          <InputGroupInput aria-label="Parcel number" value={value} onChange={(e) => setValue(e.target.value)} aria-invalid={!valid} aria-describedby="apn-help" className="font-mono" />
          <InputGroupAddon align="inline-end">
            {valid ? <CheckGlyph className="text-success" aria-label="Parcel found" /> : <XIcon className="text-danger" aria-hidden />}
            <InputGroupButton size="icon-xs" aria-label={copied ? "Copied" : "Copy the parcel number"} onClick={() => setCopied(true)}>
              <CopyIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <p id="apn-help" className="m-0 text-caption leading-line-caption text-fg-muted">
          {valid ? "Parcel 041-220-17, Marion County, OR." : "Use the county's format: 000-000-00."}
        </p>
      </div>
    </div>
  );
}

export function WithTextarea() {
  return (
    <InputGroup className="w-full max-w-110">
      <InputGroupAddon align="block-start">Ask about this site</InputGroupAddon>
      <InputGroupTextarea aria-label="Question" placeholder="Is the parcel within 2 miles of a 345 kV line?" />
      <InputGroupAddon align="block-end">
        <InputGroupText className="text-caption">Answers cite county records</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}
