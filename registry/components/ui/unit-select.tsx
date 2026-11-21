"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { Diamond } from "@/components/ui/diamond";
import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

/**
 * UnitSelect: the unit after a field's value, as a quiet button that opens a list of units. Pass it as an Input's
 * `unit`: `<Input unit={<UnitSelect ... />} />`. Not in Figma yet; it sits in the field's unit slot (442:107). Built on
 * Radix Select (listbox roles, typeahead and keys).
 *
 * - The button reads as the field's unit: the short unit ("ac") in 13px Forest and the brand arrow's head turned
 *   down, with no plate at rest. Under the pointer a square Fog fill steps in (150ms); it holds Mist while the list is
 *   open, and the head turns up.
 * - The list is the select's: it floats 4px under the field on its right edge, in the field's frame (white, Stone
 *   line, the cut), with 28px rows. Each row gives the unit's name and its short form on the right; the highlighted
 *   row is a Fog plate with the small cut, and the current unit is full Forest with a solid diamond before it.
 * - A new short unit rises 4px into place in the field (200ms on the ease-out), so the change reads. The parent
 *   converts the value, so the quantity stays the same (41.2 ac becomes 16.7 ha). Under reduced motion it just
 *   changes.
 */
export type Unit<T extends string = string> = { value: T; label: string; short: string };

export function UnitSelect<T extends string>({
  value,
  units,
  onValueChange,
  label = "Unit",
  disabled,
}: {
  value: T;
  units: Unit<T>[];
  onValueChange: (value: T) => void;
  /** Accessible name of the button and the list. */
  label?: string;
  disabled?: boolean;
}) {
  const container = usePortalContainer();
  const current = units.find((u) => u.value === value) ?? units[0];
  return (
    <SelectPrimitive.Root value={current.value} onValueChange={(v) => onValueChange(v as T)} disabled={disabled}>
      <SelectPrimitive.Trigger
        data-slot="unit-select"
        aria-label={`${label}: ${current.label}`}
        className={cn(
          "group/unit -mr-2 inline-flex h-6 cursor-pointer items-center gap-1.5 px-2 font-sans text-body leading-tight text-fg outline-none",
          "transition-[background-color] duration-fast ease-out motion-reduce:transition-none pointer-fine:hover:bg-subtle active:bg-subtle-hover active:duration-0 data-[state=open]:bg-subtle-hover",
          "focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong disabled:cursor-not-allowed disabled:text-fg-subtle",
        )}
      >
        {/* Keyed by the unit: a new unit rises into place. */}
        <span key={current.value} className="motion-safe:animate-[ds-rise_var(--ds-duration-base)_var(--ds-easing-out)_both]">
          {current.short}
        </span>
        <ArrowRightIcon size={16} head className="rotate-90 transition-transform duration-fast ease-out group-data-[state=open]/unit:-rotate-90 motion-reduce:transition-none" />
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal container={container}>
        <SelectPrimitive.Content
          data-slot="unit-select-content"
          aria-label={label}
          position="popper"
          align="end"
          // The trigger sits 6px above the field's bottom line: 10px puts the list 4px under the field.
          sideOffset={10}
          alignOffset={-8}
          className={cn(
            "ds-cut-frame z-50 min-w-40 origin-(--radix-select-content-transform-origin) overflow-hidden text-fg [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]",
            "data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in motion-reduce:animate-none",
          )}
        >
          <SelectPrimitive.Viewport className="fade-y flex flex-col gap-px p-1">
            {units.map((u) => (
              <SelectPrimitive.Item
                key={u.value}
                value={u.value}
                data-slot="unit-select-item"
                className={cn(
                  "ds-cut flex h-7 cursor-default items-center gap-2 px-3 font-sans text-body leading-tight text-fg-secondary outline-none select-none [--ds-cut:var(--ds-cut-sm)]",
                  "data-highlighted:[--ds-shape-fill:var(--ds-color-bg-subtle)] data-[state=checked]:text-fg",
                )}
              >
                <span className="flex w-2 shrink-0 items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <Diamond size={8} className="size-1.5" />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <span className="flex-1 whitespace-nowrap">
                  <SelectPrimitive.ItemText>{u.label}</SelectPrimitive.ItemText>
                </span>
                <span className="shrink-0 text-caption">{u.short}</span>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
