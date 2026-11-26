# Checkbox
A 16px square with no cut: Bone inside a 1px Stone line when off, Forest with Mireye's Bone check when on, Forest with a Bone rule when mixed. An empty box steps to Fog under the pointer. Its label is 13px Forest 12px after it.

Install: npx mireye-ds add checkbox
Requires: theme, icons, utils
Packages: @chakra-ui/react
Exports: Checkbox
Client boundary: yes
Reference: Figma "UI · Controls" (442:145): Exclude floodplain, on and off


## Usage
Use for independent options applied when a form is submitted (exclude floodplain, layers to show). Pass the label as children so a click on it toggles the box. Use the indeterminate state for a parent that covers some of its children. For a setting that applies at once use Switch.
- Avoid: A round or cut checkbox
- Avoid: An animated check
- Avoid: A checkbox that acts at once like a switch


## Examples
Example components: npx mireye-ds add checkbox
[Preview](https://mireye-ds.agencidev.com/preview/checkbox/Preview) | [Group](https://mireye-ds.agencidev.com/preview/checkbox/Group) | [States](https://mireye-ds.agencidev.com/preview/checkbox/States)

examples/checkbox.tsx

```tsx
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

```

## Source

components/ui/checkbox.tsx

```tsx
"use client";

import * as React from "react";
import { Checkbox as ChakraCheckbox } from "@chakra-ui/react";

import { CheckIcon } from "@/components/icons/check";
import { cn } from "@/lib/utils";

// Mireye's checkbox (Figma "UI · Controls", 442:145: Exclude floodplain) at the product scale: a 16px square (Figma's
// 28px), no cut, as every small control. Off it is white inside a 1px Stone line; on it is a Forest fill with Mireye's
// white check (the 1.75px stroke from the board). Figma has no mixed state: "indeterminate" is the Forest fill with a
// white 8px rule. Under the pointer an empty box steps to Fog over 150ms; the check itself appears at once. Keyboard
// focus is the 1px Forest outline 2px outside; aria-invalid turns the line brick. Disabled sits on Mist with a Slate
// mark. `children` is the label: 13px Forest, 12px after the box (Figma's 20px), and a click on it toggles the box.
type CheckboxProps = Omit<React.ComponentProps<typeof ChakraCheckbox.Root>, "onCheckedChange"> & {
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
};

function Checkbox({ className, onCheckedChange, children, ...props }: CheckboxProps) {
  return (
    <ChakraCheckbox.Root
      unstyled
      data-slot="checkbox"
      className={cn(
        "peer group/checkbox inline-flex shrink-0 cursor-pointer items-center gap-3 font-sans text-body leading-line-body text-fg outline-none data-disabled:cursor-not-allowed data-disabled:text-fg-subtle",
        className,
      )}
      onCheckedChange={(details) => onCheckedChange?.(details.checked)}
      {...props}
    >
      <ChakraCheckbox.HiddenInput />
      <ChakraCheckbox.Control
        data-slot="checkbox-control"
        className={cn(
          "flex size-4 shrink-0 items-center justify-center border border-line bg-surface text-on-primary transition-[background-color] duration-fast ease-out motion-reduce:transition-none",
          "group-hover/checkbox:bg-subtle group-data-[state=checked]/checkbox:border-line-strong group-data-[state=checked]/checkbox:bg-inverse group-data-[state=indeterminate]/checkbox:border-line-strong group-data-[state=indeterminate]/checkbox:bg-inverse",
          "group-data-focus-visible/checkbox:outline-solid group-data-focus-visible/checkbox:outline-1 group-data-focus-visible/checkbox:outline-offset-2 group-data-focus-visible/checkbox:outline-line-strong",
          "group-data-invalid/checkbox:border-danger group-aria-invalid/checkbox:border-danger",
          "group-data-disabled/checkbox:border-line group-data-disabled/checkbox:bg-subtle-hover group-data-disabled/checkbox:text-fg-subtle",
        )}
      >
        <CheckIcon data-slot="checkbox-indicator" className="hidden group-data-[state=checked]/checkbox:block" />
        <span aria-hidden data-slot="checkbox-indicator" className="hidden h-px w-2 bg-current group-data-[state=indeterminate]/checkbox:block" />
      </ChakraCheckbox.Control>
      {children != null && (
        <ChakraCheckbox.Label data-slot="checkbox-label" className="select-none">
          {children}
        </ChakraCheckbox.Label>
      )}
    </ChakraCheckbox.Root>
  );
}

export { Checkbox };

```
