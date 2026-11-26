# Input group
A field with things inside it: the field's frame around a borderless input, with addons 16px in: the parcel glyph, a unit in 13px Forest, a Dial while a check runs, a key hint, an icon key, or a Fog segment behind a Stone rule. Addons can sit above or below a textarea.

Install: npx mireye-ds add input-group
Requires: theme, button, input, utils
Packages: class-variance-authority
Exports: InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea
Client boundary: yes
Reference: Figma "UI · Inputs" (442:107): the Search row and the unit slot


## Usage
Use for a search field (the parcel glyph first, as in Figma), a value with a unit or a fixed prefix (APN), a field with a live check (the Dial, then a check or a brick x) or a copy key, and a question box with a caption above or below.
- Avoid: A spinner other than the Dial
- Avoid: Addons that change the field's height
- Avoid: Two segments on one side


## Examples
Example components: npx mireye-ds add input-group icons dial kbd label
Example packages: @phosphor-icons/react
[Preview](https://mireye-ds.agencidev.com/preview/input-group/Preview) | [Units](https://mireye-ds.agencidev.com/preview/input-group/Units) | [Checking](https://mireye-ds.agencidev.com/preview/input-group/Checking) | [WithTextarea](https://mireye-ds.agencidev.com/preview/input-group/WithTextarea)

examples/input-group.tsx

```tsx
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

```

## Source

components/ui/input-group.tsx

```tsx
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Button } from "@/components/ui/button";
import { fieldFrameClassName } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// A field with things inside it: Input's frame (white, 1px Stone line, the 8px cut; Forest while its control has focus,
// brick when invalid, Fog read-only, Mist disabled) around a borderless control 16px in, with addons 12px from either
// end. An addon is a 16px glyph in 72% Forest (the parcel glyph on a search), a unit in 13px Forest ("ac", as in
// Figma), a Dial while a check runs, or a `segment`: a Fog block behind a Stone rule for a fixed prefix or suffix.
// Addons can also sit above or below a textarea (block-start, block-end).
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        fieldFrameClassName,
        "group/input-group relative flex h-9 w-full min-w-0 items-center",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto",
        "has-[>[data-align=inline-start]]:[&>input]:pl-2 has-[>[data-align=inline-end]]:[&>input]:pr-2 has-[>[data-align=block-start]]:[&>textarea]:pt-1 has-[>[data-align=block-end]]:[&>textarea]:pb-1",
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto shrink-0 cursor-text items-center justify-center gap-2 font-sans text-body leading-tight text-fg select-none group-has-[[data-slot=input-group-control]:disabled]/input-group:cursor-not-allowed group-has-[[data-slot=input-group-control]:disabled]/input-group:text-fg-subtle [&>svg:not([data-slot]):not([class*='size-'])]:size-4 [&>svg:not([data-slot]):not([class*='text-'])]:text-icon-secondary",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-4 has-[>button]:pl-1",
        "inline-end": "order-last pr-4 has-[>button]:pr-1",
        "block-start": "order-first w-full justify-start px-4 pt-2 text-caption text-fg-secondary",
        "block-end": "order-last w-full justify-start px-4 pb-2 text-caption text-fg-secondary",
      },
      variant: {
        plain: "",
        segment: "my-px self-stretch border-line bg-subtle px-3 text-caption text-fg-secondary",
      },
    },
    compoundVariants: [
      { variant: "segment", align: "inline-end", className: "mr-px border-l pr-3" },
      { variant: "segment", align: "inline-start", className: "ml-px border-r pl-3 [clip-path:polygon(calc(var(--ds-cut)_-_0.7929px)_0,100%_0,100%_100%,0_100%,0_calc(var(--ds-cut)_-_0.7929px))]" },
    ],
    defaultVariants: { align: "inline-start", variant: "plain" },
  },
);

function InputGroupAddon({ className, align = "inline-start", variant = "plain", ...props }: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      data-variant={variant}
      className={cn(inputGroupAddonVariants({ align, variant }), className)}
      onClick={(e) => {
        // A click on the addon (not on a button in it) focuses the control, as a click inside a field would.
        if ((e.target as HTMLElement).closest("button")) return;
        e.currentTarget.parentElement?.querySelector<HTMLElement>("input, textarea")?.focus();
      }}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva("shadow-none", {
  variants: {
    size: {
      xs: "h-6 gap-1 px-2 text-caption",
      sm: "h-7 gap-1.5 px-2.5",
      "icon-xs": "size-6 p-0",
      "icon-sm": "size-7 p-0",
    },
  },
  defaultVariants: { size: "xs" },
});

function InputGroupButton({ className, type = "button", variant = "ghost", size = "xs", ...props }: Omit<React.ComponentProps<typeof Button>, "size"> & VariantProps<typeof inputGroupButtonVariants>) {
  return <Button type={type} data-size={size} variant={variant} className={cn(inputGroupButtonVariants({ size }), className)} {...props} />;
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("flex items-center gap-2 font-sans text-body leading-tight text-fg-muted [&_svg]:pointer-events-none [&_svg:not([data-slot]):not([class*='size-'])]:size-4", className)} {...props} />;
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input-group-control"
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent px-4 font-sans text-body leading-tight text-fg caret-fg outline-none placeholder:text-fg-subtle selection:bg-subtle-hover read-only:text-fg-subtle disabled:cursor-not-allowed disabled:text-fg-subtle",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="input-group-control"
      className={cn(
        "field-sizing-content flex min-h-18 w-full min-w-0 flex-1 resize-none bg-transparent px-4 py-2 font-sans text-body leading-line-body text-fg caret-fg outline-none placeholder:text-fg-subtle selection:bg-subtle-hover read-only:text-fg-subtle disabled:cursor-not-allowed disabled:text-fg-subtle",
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea };

```
