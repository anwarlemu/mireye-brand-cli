import * as React from "react";
import { cn, svgBox, svgSize } from "@/lib/utils";

/**
 * Dial: Mireye's spinner. Ticks around a circle; the head tick is Forest and the ticks behind
 * it fade to Mist. Geometry and colors are Figma's ("Dial" layers on the Buttons and Loaders
 * boards). It turns one tick per step, so it reads as a survey instrument, not a smooth wheel.
 *
 * The two boards draw it turning opposite ways, and we keep both:
 * - 24px (Buttons): 12 ticks, the tail trails clockwise, so the head turns counter-clockwise.
 * - 36px and 140px (Loaders, 443:2): 24 ticks, the tail trails counter-clockwise, and the design's
 *   five 36px frames step the head clockwise, five ticks at a time (heads 0, 5, 10, 15, 20).
 * `head` sets where the head tick sits when the dial is still (specimens, reduced motion).
 */

type DialSpec = {
  ticks: number;
  /** Radius where each tick starts and ends, from the center. */
  inner: number;
  outer: number;
  stroke: number;
  /** Colors from the head backwards; ticks past the ramp use the last color. */
  ramp: string[];
  /** The head turns clockwise and the tail trails counter-clockwise. */
  clockwise?: boolean;
  /** Spin animation (one tick per step). Defaults to the 24px dial's 12-step turn. */
  spin?: string;
};

/**
 * A ramp from Forest towards Mist: `steps` colors, each `share` more Mist than the last, then
 * Mist. Figma's ramps are exactly these mixes, within rounding: the 24px dial's nine colors
 * (#1E231C, #363B34 … #DCDEDA) step by an eighth; the Loaders' eighteen (#1E231C, #2A2E28 …
 * #D7D9D5, then #DCDEDA) by about 6%.
 */
const ramp = (steps: number, share: number) => [
  ...Array.from({ length: steps }, (_, i) => `color-mix(in srgb, var(--ds-color-forest) ${Math.round((1 - i * share) * 1000) / 10}%, var(--ds-color-mist))`),
  "var(--ds-color-mist)",
];

// Loaders board ramp (443:77, 443:103 …): 17 steps from Forest towards Mist, then Mist.
const RAMP_24_TICKS = ramp(17, 0.0608);

export const DIALS = {
  // Buttons board, icon button "Loading" (442:76): 24×24, 12 ticks, head at 12 o'clock.
  24: {
    ticks: 12,
    inner: 6.72,
    outer: 11,
    stroke: 1.5,
    ramp: ramp(8, 1 / 8),
  },
  // Loaders board frames (443:103, 443:129, 443:155, 443:181, 443:207): 36×36, 24 ticks.
  // Figma gives no timing. One turn takes 1.2s, like the 24px dial, so both turn at the same speed.
  // `reverse` runs the shared counter-clockwise keyframes backwards, so the head turns clockwise.
  36: {
    ticks: 24,
    inner: 10.08,
    outer: 17,
    stroke: 1.5,
    ramp: RAMP_24_TICKS,
    clockwise: true,
    spin: "motion-safe:animate-[ds-dial_1.2s_steps(24)_infinite_reverse]",
  },
  // Loaders board hero (443:77): 140×140, 24 ticks, 2px strokes, head at 3 o'clock (`head={6}`).
  140: {
    ticks: 24,
    inner: 39.2,
    outer: 69,
    stroke: 2,
    ramp: RAMP_24_TICKS,
    clockwise: true,
    spin: "motion-safe:animate-[ds-dial_1.2s_steps(24)_infinite_reverse]",
  },
} satisfies Record<number, DialSpec>;

export function Dial({
  size = 24,
  spec,
  running = true,
  head = 0,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  size?: keyof typeof DIALS;
  spec?: DialSpec;
  running?: boolean;
  /** Tick index of the head when still, counted clockwise from 12 o'clock. */
  head?: number;
}) {
  const s: DialSpec = spec ?? DIALS[size];
  const box = size;
  const c = box / 2;
  const n = s.ticks;
  const lines = Array.from({ length: n }, (_, k) => {
    // Tick k sits at k steps clockwise from 12 o'clock. Its distance behind the head picks the
    // color: clockwise from the head on the 24px dial, counter-clockwise on the Loaders dials.
    const a = (k * 2 * Math.PI) / n;
    const behind = (((s.clockwise ? head - k : k - head) % n) + n) % n;
    const r2 = (v: number) => Math.round(v * 100) / 100;
    return {
      x1: r2(c + s.inner * Math.sin(a)),
      y1: r2(c - s.inner * Math.cos(a)),
      x2: r2(c + s.outer * Math.sin(a)),
      y2: r2(c - s.outer * Math.cos(a)),
      color: s.ramp[Math.min(behind, s.ramp.length - 1)],
    };
  });
  return (
    <svg
      width={box}
      height={box}
      viewBox={`0 0 ${box} ${box}`}
      fill="none"
      // An image named "Loading" while it runs; decoration when still.
      role={running ? "img" : undefined}
      aria-label={running ? "Loading" : undefined}
      aria-hidden={running ? undefined : true}
      data-slot="dial"
      className={cn(
        "shrink-0",
        // One tick per step, counter-clockwise so the head leads the fading tail.
        running && (s.spin ?? "motion-safe:animate-[ds-dial_1.2s_steps(12)_infinite]"),
        svgBox,
        className,
      )}
      {...props}
      style={svgSize(box, box, props.style)}
    >
      {lines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeWidth={s.stroke} style={{ stroke: l.color }} />
      ))}
    </svg>
  );
}
