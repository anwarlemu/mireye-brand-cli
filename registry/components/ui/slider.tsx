"use client";

import * as React from "react";
import { Slider as ChakraSlider } from "@chakra-ui/react";

import { cn } from "@/lib/utils";

// Mireye's slider is a ruler (Figma "UI · Inputs", 442:107: the Range under the Filled field). The track is a row of
// 1px Stone ticks, 8px tall and 6px apart (the hatch pitch), in a 16px band; the handle is a 1.5px Forest line the
// full 16px tall, with a 12px wide hit area around it. One value marks itself with the handle alone, as in Figma; a
// range (two values) also draws the ticks between its handles in Forest. The handle follows the pointer and never
// animates its position. Keyboard focus is the 1px Forest outline 2px outside the handle; disabled turns the ticks
// Mist and the handle Slate. For a value with a field and helper text, and the snapping, lens-like ruler of the
// design, use Range. Pass two values for a range; `orientation="vertical"` turns the ruler on its side.
const ticks = (color: string, vertical: boolean) =>
  `repeating-linear-gradient(${vertical ? "to bottom" : "to right"}, ${color} 0 1px, transparent 1px var(--ds-hatch-pitch))`;

type SliderProps = Omit<React.ComponentProps<typeof ChakraSlider.Root>, "onValueChange" | "aria-label" | "aria-labelledby"> & {
  onValueChange?: (value: number[]) => void;
  "aria-label"?: string | string[];
  "aria-labelledby"?: string | string[];
};
function Slider({ className, defaultValue, value, min = 0, max = 100, orientation = "horizontal", onValueChange, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...props }: SliderProps) {
  const values = React.useMemo(() => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]), [value, defaultValue, min, max]);
  const vertical = orientation === "vertical";
  return (
    <ChakraSlider.Root
      unstyled
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      orientation={orientation}
      onValueChange={(details) => onValueChange?.(details.value)}
      aria-label={ariaLabel === undefined ? undefined : Array.isArray(ariaLabel) ? ariaLabel : [ariaLabel]}
      aria-labelledby={ariaLabelledBy === undefined ? undefined : Array.isArray(ariaLabelledBy) ? ariaLabelledBy : [ariaLabelledBy]}
      min={min}
      max={max}
      className={cn(
        "group/slider relative flex w-full touch-none items-center select-none data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <ChakraSlider.Control data-slot="slider-control" className="relative flex grow cursor-pointer items-center data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-4 data-[orientation=vertical]:flex-col data-disabled:cursor-not-allowed">
        <ChakraSlider.Track data-slot="slider-track" className="relative grow data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2">
          <span aria-hidden className="absolute inset-0 group-data-disabled/slider:opacity-50" style={{ backgroundImage: ticks("var(--ds-color-border-default)", vertical) }} />
          {values.length > 1 && (
            // The Forest ticks run under the whole track and show only between the handles, so they stay on the grid.
            <ChakraSlider.Context>
              {(api) => {
                const share = (v: number) => (max > min ? ((v - min) / (max - min)) * 100 : 0);
                const lo = share(Math.min(...api.value));
                const hi = share(Math.max(...api.value));
                return (
                  <span
                    aria-hidden
                    data-slot="slider-range"
                    className="absolute inset-0"
                    style={{ backgroundImage: ticks("var(--ds-color-border-strong)", vertical), clipPath: vertical ? `inset(${100 - hi}% 0 ${lo}% 0)` : `inset(0 ${100 - hi}% 0 ${lo}%)` }}
                  />
                );
              }}
            </ChakraSlider.Context>
          )}
        </ChakraSlider.Track>
        {Array.from({ length: values.length }, (_, index) => (
          <ChakraSlider.Thumb
            data-slot="slider-thumb"
            index={index}
            key={index}
            aria-label={Array.isArray(ariaLabel) ? ariaLabel[index] : ariaLabel ?? (values.length > 1 ? (index === 0 ? "Minimum" : "Maximum") : undefined)}
            className={cn(
              "flex shrink-0 cursor-grab items-center justify-center text-fg outline-none active:cursor-grabbing data-disabled:pointer-events-none data-disabled:text-fg-subtle",
              "data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-3 data-[orientation=vertical]:h-3 data-[orientation=vertical]:w-4",
              "focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong",
            )}
          >
            <span aria-hidden className="bg-current in-data-[orientation=horizontal]:h-full in-data-[orientation=horizontal]:w-[1.5px] in-data-[orientation=vertical]:h-[1.5px] in-data-[orientation=vertical]:w-full" />
            <ChakraSlider.HiddenInput />
          </ChakraSlider.Thumb>
        ))}
      </ChakraSlider.Control>
    </ChakraSlider.Root>
  );
}

export { Slider };
