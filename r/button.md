# Button
Mireye's keys with the cut corner: the Forest primary (default), the framed secondary (outline, a Forest line on Bone), a Fog key (secondary), the text button (ghost: an 80% Forest label that turns Forest), destructive and link. 36px tall with 16px sides and a 13px medium label; the fill steps once on hover and back at once on press. Loading walks a tick bar, or turns the Dial on icon keys.

Install: npx mireye-ds add button
Requires: theme, dial, ticks, use-loop-frame, utils
Packages: @chakra-ui/react, class-variance-authority
Exports: Button, buttonVariants
Client boundary: yes
Reference: Figma "UI · Buttons" (442:3): Primary, Secondary, Text and Icon rows in Default, Hover, Loading and Disabled; the chat Ask key (443:464)


## Usage
Use one default key per view for the action that moves the task forward (Find sites), with `arrow` for a forward action. Use outline for the actions beside it and for icon keys (size icon, always with aria-label), ghost for a low-weight action inside content (add `arrow` when it goes somewhere), secondary for a quiet key in a toolbar or on a dark ground, destructive for the one destructive action in a dialog, and link for an action inside text. Set `loading` while the action runs: the key keeps its size and ignores clicks. Use size sm (32px) for the chat Ask key and dense rows.
- Avoid: Rounded corners or a shadow
- Avoid: A hatch, outline, shadow or size change on hover
- Avoid: An arrow or icon that moves on hover
- Avoid: A spinner other than the Dial or the tick bar
- Avoid: Two Forest keys side by side
- Avoid: Bold or uppercase labels
- Avoid: A faded (half-opacity) disabled key


## Examples
Example components: npx mireye-ds add button icons
Example packages: @phosphor-icons/react
[Preview](https://mireye-ds.agencidev.com/preview/button/Preview) | [Variants](https://mireye-ds.agencidev.com/preview/button/Variants) | [Loading](https://mireye-ds.agencidev.com/preview/button/Loading) | [States](https://mireye-ds.agencidev.com/preview/button/States)

examples/button.tsx

```tsx
"use client";

import * as React from "react";
import { DownloadSimpleIcon, MapPinIcon, TrashIcon } from "@phosphor-icons/react/ssr";

import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";

export function Preview() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button arrow>Find sites</Button>
      <Button variant="outline" arrow>
        Compare parcels
      </Button>
      <Button variant="ghost" arrow>
        View report
      </Button>
      <Button variant="outline" size="icon" aria-label="Add a site">
        <PlusIcon />
      </Button>
    </div>
  );
}

export function Variants() {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button>Save criteria</Button>
        <Button variant="outline">
          <DownloadSimpleIcon />
          Export parcels
        </Button>
        <Button variant="secondary">Skip</Button>
        <Button variant="destructive">
          <TrashIcon />
          Delete site
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost">Clear filters</Button>
        <Button variant="ghost" size="icon" aria-label="Locate the parcel">
          <MapPinIcon />
        </Button>
        <Button variant="link">Read the zoning notes</Button>
      </div>
    </div>
  );
}

// A loading key walks its tick bar and keeps its size; an icon key turns the Dial; the text button shimmers.
export function Loading() {
  const [loading, setLoading] = React.useState(true);
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button arrow loading={loading} className="w-40 justify-between">
          Find sites
        </Button>
        <Button variant="outline" arrow loading={loading} className="w-40 justify-between">
          Find sites
        </Button>
        <Button variant="outline" size="icon" aria-label="Add a site" loading={loading}>
          <PlusIcon />
        </Button>
        <Button variant="ghost" arrow loading={loading}>
          Scanning parcels
        </Button>
      </div>
      <div>
        <Button variant="link" onClick={() => setLoading((l) => !l)}>
          {loading ? "Stop loading" : "Start loading"}
        </Button>
      </div>
    </div>
  );
}

export function States() {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button arrow disabled>
          Find sites
        </Button>
        <Button variant="outline" arrow disabled>
          Find sites
        </Button>
        <Button variant="ghost" arrow disabled>
          Find sites
        </Button>
        <Button variant="outline" size="icon" aria-label="Add a site" disabled>
          <PlusIcon />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" arrow>
          Ask
        </Button>
        <Button arrow>Find sites</Button>
        <Button size="lg" arrow>
          Find sites
        </Button>
      </div>
    </div>
  );
}

```

## Source

components/ui/button.tsx

```tsx
"use client";

import * as React from "react";
import { Button as ChakraButton } from "@chakra-ui/react";
import { cva, type VariantProps } from "class-variance-authority";

import { Dial } from "@/components/ui/dial";
import { Ticks } from "@/components/ui/ticks";
import { usePrefersReducedMotion } from "@/lib/use-loop-frame";
import { cn, svgBox, svgSize } from "@/lib/utils";

// Mireye's keys (Figma "UI · Buttons", 442:3), at the product scale (0.6 of the board, on the 4px grid).
// - default: the primary key. A Forest fill with the cut corner (ds-cut), a white 13px medium label, 36px tall with
//   16px sides (Figma's 64px and 28px). Hover steps the fill once to the lighter Forest over 150ms; pressing steps it
//   back at once. Disabled is a Mist fill with a Slate label.
// - outline: the secondary key. White inside a 1px Forest line with the cut (ds-cut-frame); hover steps to Fog, press
//   to Mist. Disabled keeps white with a Stone line and a Slate label.
// - secondary: a Fog key with the cut, for an action beside the primary on a dark ground or a quiet toolbar; hover Mist.
// - ghost: the text button (redesigned after Figma's underline): an 80% Forest label, no fill and no sides, that
//   turns Forest under the pointer. Pass `arrow` for the forward arrow after it. As an icon key it is the glyph alone.
// - destructive: the primary key in brick, for the one destructive action in a dialog.
// - link: Forest text, underlined in Stone; the underline turns Forest under the pointer.
// Nothing moves on hover: no hatch, outline, shadow, size change or arrow nudge. Keyboard focus is a 1px Forest
// outline 2px outside, square.
// `loading` keeps the key's size and swaps its content for the tick bar: four lit ticks walk one 6px tick every 50ms
// and wrap, since a key reports no real progress; icon keys turn the Dial; the ghost label shimmers. Under reduced
// motion the ticks hold a still frame. A loading key keeps focus, sets aria-busy and ignores clicks.
// Mireye glyphs (data-slot="icon": the arrow, plus, check) keep their Figma proportions; Phosphor glyphs are 16px.
const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-sans text-body leading-tight font-medium whitespace-nowrap outline-none select-none",
    "after:transition-[background-color] after:duration-fast after:ease-out active:after:duration-0 motion-reduce:after:transition-none",
    "focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong",
    "disabled:cursor-not-allowed aria-disabled:cursor-not-allowed aria-busy:cursor-progress",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([data-slot=icon]):not([data-slot=dial]):not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: [
          "ds-cut text-on-primary [--ds-shape-fill:var(--ds-color-action-primary)]",
          "not-disabled:not-aria-busy:hover:[--ds-shape-fill:var(--ds-color-action-primary-hover)] not-disabled:not-aria-busy:active:[--ds-shape-fill:var(--ds-color-action-primary)]",
          "disabled:text-fg-subtle disabled:[--ds-shape-fill:var(--ds-color-action-disabled)]",
        ],
        outline: [
          "ds-cut-frame text-fg [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-strong)]",
          "not-disabled:not-aria-busy:hover:[--ds-shape-fill:var(--ds-color-bg-subtle)] not-disabled:not-aria-busy:active:[--ds-shape-fill:var(--ds-color-bg-subtle-hover)] aria-expanded:[--ds-shape-fill:var(--ds-color-bg-subtle)]",
          "disabled:text-fg-subtle disabled:[--ds-shape-stroke:var(--ds-color-border-default)]",
        ],
        secondary: [
          "ds-cut text-fg [--ds-shape-fill:var(--ds-color-bg-subtle)]",
          "not-disabled:not-aria-busy:hover:[--ds-shape-fill:var(--ds-color-bg-subtle-hover)] not-disabled:not-aria-busy:active:[--ds-shape-fill:var(--ds-color-bg-subtle)]",
          "disabled:text-fg-subtle disabled:[--ds-shape-fill:var(--ds-color-bg-subtle)]",
        ],
        destructive: [
          "ds-cut text-white [--ds-shape-fill:var(--ds-color-status-danger)]",
          "not-disabled:not-aria-busy:hover:[--ds-shape-fill:var(--ds-color-status-danger-strong)] not-disabled:not-aria-busy:active:[--ds-shape-fill:var(--ds-color-status-danger)]",
          "disabled:text-fg-subtle disabled:[--ds-shape-fill:var(--ds-color-action-disabled)]",
        ],
        ghost: [
          "text-fg-secondary transition-[color] duration-fast ease-out motion-reduce:transition-none",
          "not-disabled:not-aria-busy:hover:text-fg aria-expanded:text-fg data-[state=open]:text-fg disabled:text-fg-subtle",
        ],
        link: [
          "font-normal text-fg underline decoration-line underline-offset-4 transition-[text-decoration-color] duration-fast ease-out motion-reduce:transition-none",
          "not-disabled:hover:decoration-line-strong disabled:text-fg-subtle",
        ],
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 [--ds-cut:var(--ds-cut-md)]",
        lg: "h-10 px-5",
        icon: "size-9 px-0",
        "icon-sm": "size-8 px-0 [--ds-cut:var(--ds-cut-md)]",
        "icon-lg": "size-10 px-0",
      },
    },
    compoundVariants: [
      // The text button has no sides, so its label lines up with the text around it.
      { variant: "ghost", size: ["default", "sm", "lg"], className: "px-0" },
      { variant: "link", className: "h-auto px-0" },
    ],
    defaultVariants: { variant: "default", size: "default" },
  },
);

type ButtonProps = Omit<React.ComponentProps<typeof ChakraButton>, "variant" | "size" | "loading"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Walks the tick bar (or turns the Dial on icon keys) and ignores clicks, keeping the key's size. */
    loading?: boolean;
    /** The brand's forward arrow after the label, as on every key in Figma. */
    arrow?: boolean;
  };

function Button({ className, variant, size, asChild = false, loading = false, arrow = false, type, children, onClick, ...props }: ButtonProps) {
  const v = variant ?? "default";
  const s = size ?? "default";
  const icon = typeof s === "string" && s.startsWith("icon");
  const content = (
    <>
      {children}
      {arrow && <ArrowRightIcon />}
    </>
  );
  return (
    <ChakraButton
      unstyled
      asChild={asChild}
      data-slot="button"
      data-variant={v}
      data-size={s}
      aria-busy={loading || undefined}
      type={asChild ? type : (type ?? "button")}
      // A loading key keeps its look and focus but ignores clicks.
      onClick={loading ? (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault() : onClick}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {asChild || !loading ? (
        asChild ? children : content
      ) : v === "ghost" || v === "link" ? (
        <span className="contents">
          <span className="ds-shimmer">{children}</span>
          {arrow && <ArrowRightIcon />}
        </span>
      ) : icon ? (
        <>
          {/* The glyph stays in the layout, invisible, so the key keeps its size. */}
          <span aria-hidden className="invisible contents">{children}</span>
          <span className="absolute inset-0 flex items-center justify-center">
            <Dial size={24} running />
          </span>
        </>
      ) : (
        <>
          <span aria-hidden className="invisible flex items-center gap-2">
            {content}
          </span>
          <LoadingTicks variant={v} lit={s === "sm" ? 3 : 4} />
          {/* The label stays the key's name for assistive tech; aria-busy says it is loading. */}
          <span className="sr-only">{children}</span>
        </>
      )}
    </ChakraButton>
  );
}

/** The brand's forward arrow. It mirrors icons/arrow-right at 20px (same path, 1.5px stroke, square caps), drawn here so a key needs no
 * icon item. */
function ArrowRightIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden data-slot="icon" className={svgBox} style={svgSize(20)}>
      <path d="M0 10H19M10.5 18.5L19 10L10.5 1.5" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

const PITCH = 6;

/**
 * The loading bar: as many 6px-pitch lines as fit between the key's side paddings (24 at most, Figma's bar), centred
 * on a whole pixel. The lit group walks one line every 50ms and wraps, clipped by the bar. Under reduced motion it
 * holds Figma's still frame, 14 of 24 lines lit.
 */
function LoadingTicks({ variant, lit }: { variant: string; lit: number }) {
  const reduced = usePrefersReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const [box, setBox] = React.useState<{ lines: number; left: number } | null>(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const lines = Math.max(2, Math.min(24, Math.floor((w - 1) / PITCH) + 1));
      setBox({ lines, left: Math.floor((w - (lines - 1) * PITCH - 1) / 2) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const dark = variant === "default" || variant === "destructive";
  const on = dark ? "var(--ds-color-action-primary-fg)" : "var(--ds-color-border-strong)";
  const off = dark ? "var(--ds-color-track-dark)" : "var(--ds-color-border-default)";
  return (
    <span ref={ref} aria-hidden data-slot="button-loader" className="pointer-events-none absolute inset-y-0 inset-x-4 flex items-center group-data-[size=sm]/button:inset-x-3 group-data-[size=lg]/button:inset-x-5">
      {box && (
        <Ticks
          pitch={PITCH}
          filled={reduced ? Math.round((box.lines * 14) / 24) : lit}
          on={on}
          off={off}
          className={cn("h-3", !reduced && "overflow-hidden [&>span]:animate-[ds-tick-walk_var(--tick-walk-ms)_steps(var(--tick-walk-steps),end)_infinite]")}
          style={
            {
              marginLeft: box.left,
              width: (box.lines - 1) * PITCH + 1,
              "--ds-walk": `${box.lines * PITCH}px`,
              "--tick-walk-ms": `${box.lines * 50}ms`,
              "--tick-walk-steps": box.lines,
            } as React.CSSProperties
          }
        />
      )}
    </span>
  );
}

export { Button, buttonVariants };

```
