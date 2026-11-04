"use client";

import * as React from "react";
import { cn, svgBox, svgSize } from "@/lib/utils";
import { Diamond } from "@/components/ui/diamond";

/**
 * Map: the overlays Mireye draws on its map, in one component. The map itself is the
 * product's (aerial imagery, as in the client's Figma); these sit on top of it.
 * - MapMarker and MapTag: a survey point with its survey lines and reading.
 * - MapScale: the scale bar, bottom left.
 * - MapControls: zoom in and out, bottom right.
 * Source: Figma "UI · Map marker" (443:395).
 *
 * Sizes in these comments are Figma's. Every offset from the map point (survey lines, nodes,
 * leader) keeps Figma's geometry at the product scale (0.6, through `fig`), so the marks meet
 * exactly; the tag, the scale's label row and the controls snap to the 4px grid (the tag is
 * 140×44, the row tag 28px tall, a control 28px square, 4px apart).
 */

/** A Figma length at the product scale, for marks that have to meet exactly. */
const fig = (px: number) => `${px}px * var(--ds-scale, 0.6)`;

// Marker ------------------------------------------------------------------------------------------

/**
 * Map marker. Source: Figma "UI · Map marker" (443:395).
 *
 * A survey point drawn on the map:
 * - Survey lines (443:406…409): two horizontal and two vertical 1px Stone rules that cross the
 *   whole map. Each pair is 39px apart center to center, around the point: 20px before it and
 *   19px after it (Figma: rules at x = 740 and 779 around a point at x = 760).
 * - Nodes (443:410…416): a 9px Forest diamond centered on each of the four crossings.
 * - Leader (443:420): 1px Forest, 24px tall, from the tag's bottom to the top survey line.
 *   Figma puts it on the pixel just right of the point (x = 760); this keeps that.
 * - Tag (443:418): see MapTag. It is centered on the point and its bottom meets the leader.
 *
 * MapMarker fills its map viewport (`absolute inset-0`) so the survey lines run edge to edge;
 * `x` and `y` are the point in viewport pixels. Only the point moves. Every offset from it is
 * Figma's. The marker ignores the pointer so it never blocks panning the map underneath.
 *
 * `tone="photo"` is the look on aerial imagery, after the Figma map exploration (30 Oct): white survey
 * lines at 50%, white nodes and leader, and the Forest tag, on a photo dimmed with `ds-imagery`.
 * The default keeps Figma's Stone lines, Forest nodes and Forest tag.
 */

// Offsets from the point, in px (Figma 443:395, point at x = 760, y = 520 on the board).
const LINE_BEFORE = 20; // first survey line starts 20px before the point…
const LINE_AFTER = 19; // …the second 19px after it (39px apart, center to center).
const NODE = 9; // diamond size; it is centered on the 1px line, so it starts 4px before it.
const NODE_INSET = (NODE - 1) / 2;
const LEADER = 24; // leader height, between the tag and the top survey line.

const corners = [
  { corner: "top-left", dx: -LINE_BEFORE, dy: -LINE_BEFORE },
  { corner: "top-right", dx: LINE_AFTER, dy: -LINE_BEFORE },
  { corner: "bottom-left", dx: -LINE_BEFORE, dy: LINE_AFTER },
  { corner: "bottom-right", dx: LINE_AFTER, dy: LINE_AFTER },
] as const;

type MapMarkerProps = React.HTMLAttributes<HTMLDivElement> & {
  /** The point, in px from the left of the map viewport. */
  x: number;
  /** The point, in px from the top of the map viewport. */
  y: number;
  /** Main reading in the tag, e.g. the elevation ("412 ft"). No value and no coordinates: no tag. */
  value?: React.ReactNode;
  /** Second line of the tag, e.g. "39.7392, −104.9903". */
  coordinates?: React.ReactNode;
  /** "photo": white marks for aerial imagery. Default: Figma's Stone and Forest. */
  tone?: "default" | "photo";
  /**
   * "survey" (default): Figma's board 443:395, two pairs of survey lines, four nodes and the tag
   * above. "crosshair": the Figma map exploration (449:2): one crosshair, one framed node on the point
   * and a one-row tag beside it.
   */
  variant?: "survey" | "crosshair";
  /** Crosshair only: the side the tag sits on. Put it on the left near the map's right edge. */
  side?: "right" | "left";
};

/*
 * Crosshair marker (the Figma map exploration 449:2, 30 Oct):
 * - One horizontal and one vertical 1px survey line through the point, edge to edge.
 * - The node: a 22px outlined diamond on the point, filled so the lines stop at it, with an 8px
 *   solid diamond inside (the current-step node, made larger). Light maps: Forest outline on
 *   white, Forest inside. Photo tone: white outline on Forest, white inside.
 * - The tag: MapTag's one-row layout, its near edge 28px from the point, centered on the line.
 */
const CROSS_NODE = 22;
const CROSS_DOT = 8;
const CROSS_GAP = 28;

function CrosshairMarker({ x, y, value, coordinates, tone = "default", side = "right", className, ...props }: Omit<MapMarkerProps, "variant">) {
  const photo = tone === "photo";
  const line = photo ? "bg-fg-inverse/50" : "bg-line";
  const at = (px: number, n: number) => `calc(${px}px + ${fig(n)})`;
  const hasTag = value != null || coordinates != null;
  return (
    <div data-slot="map-marker" data-variant="crosshair" className={cn("pointer-events-none absolute inset-0", className)} {...props}>
      <span aria-hidden data-slot="survey-line" data-side="horizontal" className={cn("absolute inset-x-0 h-px", line)} style={{ top: Math.round(y) }} />
      <span aria-hidden data-slot="survey-line" data-side="vertical" className={cn("absolute inset-y-0 w-px", line)} style={{ left: Math.round(x) }} />
      <span data-slot="node" className="absolute" style={{ left: at(x + 0.5, -CROSS_NODE / 2), top: at(y + 0.5, -CROSS_NODE / 2) }}>
        <Diamond size={CROSS_NODE} variant="outline" fill={photo ? "var(--ds-color-bg-inverse)" : "var(--ds-color-bg-default)"} className={cn("block", photo ? "text-fg-inverse" : "text-fg")} />
        <Diamond
          size={CROSS_DOT}
          className={cn("absolute", photo ? "text-fg-inverse" : "text-fg")}
          style={{ left: `calc(${fig((CROSS_NODE - CROSS_DOT) / 2)})`, top: `calc(${fig((CROSS_NODE - CROSS_DOT) / 2)})` }}
        />
      </span>
      {hasTag && (
        <div className={cn("absolute -translate-y-1/2", side === "left" && "-translate-x-full")} style={{ left: at(x, side === "left" ? -CROSS_GAP : CROSS_GAP), top: y + 0.5 }}>
          <MapTag layout="row" value={value} coordinates={coordinates} />
        </div>
      )}
    </div>
  );
}

export function MapMarker({ x, y, value, coordinates, tone = "default", variant = "survey", side, className, ...props }: MapMarkerProps) {
  if (variant === "crosshair") return <CrosshairMarker x={x} y={y} value={value} coordinates={coordinates} tone={tone} side={side} className={className} {...props} />;
  const hasTag = value != null || coordinates != null;
  const photo = tone === "photo";
  const line = photo ? "bg-fg-inverse/50" : "bg-line";
  // Offsets are Figma's at the product scale; the point is px.
  const at = (px: number, n: number) => `calc(${px}px + ${fig(n)})`;
  const tagTop = at(y, -(LINE_BEFORE + LEADER)); // the tag's bottom and the leader's top
  return (
    <div data-slot="map-marker" className={cn("pointer-events-none absolute inset-0", className)} {...props}>
      <span aria-hidden data-slot="survey-line" data-side="top" className={cn("absolute inset-x-0 h-px", line)} style={{ top: at(y, -LINE_BEFORE) }} />
      <span aria-hidden data-slot="survey-line" data-side="bottom" className={cn("absolute inset-x-0 h-px", line)} style={{ top: at(y, LINE_AFTER) }} />
      <span aria-hidden data-slot="survey-line" data-side="left" className={cn("absolute inset-y-0 w-px", line)} style={{ left: at(x, -LINE_BEFORE) }} />
      <span aria-hidden data-slot="survey-line" data-side="right" className={cn("absolute inset-y-0 w-px", line)} style={{ left: at(x, LINE_AFTER) }} />

      {corners.map((c) => (
        <Diamond
          key={c.corner}
          size={NODE}
          data-corner={c.corner}
          className={cn("absolute", photo ? "text-fg-inverse" : "text-fg")}
          style={{ left: at(x, c.dx - NODE_INSET), top: at(y, c.dy - NODE_INSET) }}
        />
      ))}

      {hasTag && (
        <>
          {/* Centered on the point; translate keeps it centered if the content makes it wider. */}
          <div className="absolute -translate-x-1/2 -translate-y-full" style={{ left: x, top: tagTop }}>
            <MapTag value={value} coordinates={coordinates} />
          </div>
          <span aria-hidden data-slot="leader" className={cn("absolute w-px", photo ? "bg-fg-inverse" : "bg-line-strong")} style={{ left: x, top: tagTop, height: `calc(${fig(LEADER)})` }} />
        </>
      )}
    </div>
  );
}

/**
 * Map tag (Figma "Tooltip" 443:418): Forest fill with the 10px cut (`--ds-cut-md`), 232×72.
 * Figma path: M10 0 H232 V72 H0 V10 L10 0 Z.
 * - Value (443:421): 22px Medium, white, 20px from the left and 16px from the top.
 * - Coordinates (443:422): 16px Regular, Haze, 44px from the top (Figma y = 448 in a tag at 404).
 * - Both lines sit on fixed rows from the top (a 28px value row, then the coordinates), as
 *   Figma places them by their top edge. Their positions then never depend on the font's
 *   cap height (with Gilroy the coordinates end 17px above the bottom edge).
 * - The height is fixed at 72px because the leader hangs from the tag's bottom: the tag's
 *   size must not follow the font.
 * - 232px is a minimum (Figma's width); longer values widen the tag.
 * - `tone="photo"`: white with Forest text and 80% Forest coordinates, for a tag on its own over
 *   a busy surface. MapMarker's photo tone uses the Forest tag (the Figma map exploration, 30 Oct).
 * - `layout="row"` (the Figma map exploration 449:2, for the crosshair marker): one row, 44px tall,
 *   the 8px cut, 16px side padding; the value in 16px Medium and the coordinates in 16px Regular,
 *   20px apart, both centered on the row.
 */
export function MapTag({
  value,
  coordinates,
  tone = "default",
  layout = "stack",
  className,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  value?: React.ReactNode;
  coordinates?: React.ReactNode;
  tone?: "default" | "photo";
  /** "stack" (Figma 443:418): two rows. "row": one row, for the crosshair marker. */
  layout?: "stack" | "row";
}) {
  const photo = tone === "photo";
  if (layout === "row")
    return (
      <div
        data-slot="map-tag"
        data-tone={tone}
        data-layout="row"
        className={cn(
          "ds-cut inline-flex h-7 items-center gap-3 px-2.5 text-caption whitespace-nowrap tabular-nums [--ds-cut:var(--ds-cut-sm)]",
          photo ? "[--ds-shape-fill:var(--ds-color-bg-default)]" : "[--ds-shape-fill:var(--ds-color-bg-inverse)]",
          className,
        )}
        {...props}
      >
        {value != null && <span data-slot="value" className={cn("ds-trim font-medium", photo ? "text-fg" : "text-fg-inverse")}>{value}</span>}
        {coordinates != null && <span data-slot="coordinates" className={cn("ds-trim font-normal", photo ? "text-fg-secondary" : "text-fg-inverse-muted")}>{coordinates}</span>}
      </div>
    );
  return (
    <div
      data-slot="map-tag"
      data-tone={tone}
      className={cn(
        "ds-cut grid h-11 min-w-35 grid-rows-[calc(var(--spacing)*4)_auto] content-start items-start justify-items-start px-3 pt-2.5 tabular-nums",
        photo ? "[--ds-cut:var(--ds-cut-md)] [--ds-shape-fill:var(--ds-color-bg-default)]" : "[--ds-cut:var(--ds-cut-md)] [--ds-shape-fill:var(--ds-color-bg-inverse)]",
        className,
      )}
      {...props}
    >
      {value != null && (
        <span data-slot="value" className={cn("ds-trim whitespace-nowrap text-body font-medium", photo ? "text-fg" : "text-fg-inverse")}>
          {value}
        </span>
      )}
      {coordinates != null && (
        <span data-slot="coordinates" className={cn("ds-trim row-start-2 whitespace-nowrap text-caption font-normal", photo ? "text-fg-secondary" : "text-fg-inverse-muted")}>
          {coordinates}
        </span>
      )}
    </div>
  );
}

// Scale -------------------------------------------------------------------------------------------

/**
 * Map scale. Source: Figma "UI · Map marker" (443:395): "Scale" 443:423, labels 443:425 and 443:426.
 *
 * - Bar, 161×12, 1px Forest: a baseline on the bottom pixel row and a tick every 16px (11 ticks).
 *   Ticks 0, 5 and 10 run the full 12px; the others are 6px. The path below rebuilds Figma's
 *   (M0.5 0 V11.5 … M16.5 6 V11.5 … H161) with the same coordinates.
 * - Labels, 16px Regular Forest, sit 11px above the bar. "0" starts at the first tick. The end
 *   label is right-aligned to x = 160, the left edge of the last tick, as in Figma.
 * - The label row is as tall as the trimmed 16px labels (11px with Gilroy), so the bar starts
 *   22px below the label tops (Figma y = 818 and 840).
 * - Figma sizes the end label's box at 60px. It is a minimum here, so short labels keep
 *   Figma's box and long ones grow to the left.
 */
const PITCH = 16; // px between ticks
const SEGMENTS = 10;
const MAJOR_EVERY = 5; // full-height tick every 5 segments (0, 80, 160)
const WIDTH = PITCH * SEGMENTS + 1; // 161: the last tick is 1px wide past 160
const HEIGHT = 12;
const MINOR_TOP = 6; // minor ticks run from y = 6 to the bottom

const barPath =
  `M0 ${HEIGHT - 0.5}H${WIDTH}` +
  Array.from({ length: SEGMENTS + 1 }, (_, i) => `M${i * PITCH + 0.5} ${i % MAJOR_EVERY === 0 ? 0 : MINOR_TOP}V${HEIGHT}`).join("");

type MapScaleProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Distance the full bar covers, e.g. "500 ft". */
  label: string;
};

export function MapScale({ label, className, ...props }: MapScaleProps) {
  // A new zoom level re-reads the label: the new one rises 4px into place (150ms, ease-out).
  // Only when the label changes, so nothing moves on the first render.
  const labelRef = React.useRef<HTMLSpanElement>(null);
  const shown = React.useRef(label);
  React.useLayoutEffect(() => {
    if (shown.current === label) return;
    shown.current = label;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    labelRef.current?.animate([{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], {
      duration: 150,
      easing: "cubic-bezier(0.23, 1, 0.32, 1)",
    });
  }, [label]);
  return (
    <div
      role="img"
      aria-label={`Scale: 0 to ${label}`}
      data-slot="map-scale"
      className={cn("flex w-(--ds-svg-w) flex-col gap-1.5 text-caption font-normal text-fg", className)}
      {...props}
      style={svgSize(WIDTH, HEIGHT, props.style)}
    >
      <div className="flex w-full items-start justify-between">
        <span data-slot="start" className="ds-trim whitespace-nowrap">
          0
        </span>
        <span ref={labelRef} data-slot="label" className="ds-trim min-w-9 whitespace-nowrap text-right">
          {label}
        </span>
      </div>
      <svg
        data-slot="bar"
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        fill="none"
        aria-hidden
        className={cn("block shrink-0", svgBox)}
        style={svgSize(WIDTH, HEIGHT)}
      >
        <path d={barPath} stroke="currentColor" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

// Controls ----------------------------------------------------------------------------------------

/**
 * Map controls. Source: Figma "UI · Map marker" (443:395): "Zoom in" 443:427, "Zoom out" 443:430.
 *
 * - Each control is 48×48 with the 8px cut (`--ds-cut-sm`), a 1px Stone border and a white fill.
 *   Figma path: M8 0.5 H47.5 V47.5 H0.5 V8 L8 0.5, the frame `ds-cut-frame` draws.
 * - Glyphs are 16px strokes, 1.5px, Forest, centered: plus M24 16 V32 M16 24 H32, minus M16 24 H32.
 *   The shared PlusIcon is an 18px cross in a 20px box, so these 16px glyphs live here.
 * - The two controls stack 8px apart (Figma y = 744 and 800).
 * - Figma shows no hover on this board. Hover steps the fill to Fog and press to Mist, as on the
 *   secondary icon button, so every bordered square control behaves the same. `state="hover"`
 *   keeps the hatch for the specimen board.
 *
 * `state="hover"` forces the hover look for specimens and docs.
 */
const controlClasses = [
  "inline-flex size-7 shrink-0 cursor-pointer select-none items-center justify-center text-fg outline-none",
  "ds-cut-frame [--ds-cut:var(--ds-cut-sm)]",
  "[--ds-shape-stroke:var(--ds-color-border-default)] [--ds-shape-fill:var(--ds-color-bg-default)]",
  "[--ds-hatch-color:var(--ds-color-border-subtle)] data-[state=hover]:ds-hatch",
  // Hover steps the fill to Fog over 150ms, press to Mist at once (the buttons' hover, 29 Oct).
  "after:transition-[background-color] after:duration-150 after:ease-out active:after:duration-0",
  "enabled:hover:[--ds-shape-fill:var(--ds-color-bg-subtle)] enabled:active:[--ds-shape-fill:var(--ds-color-mist)]",
  "disabled:cursor-not-allowed disabled:text-fg-subtle",
  // aria-disabled keeps keyboard focus on a control that reaches its limit.
  "aria-disabled:cursor-not-allowed aria-disabled:text-fg-subtle aria-disabled:hover:[--ds-shape-fill:var(--ds-color-bg-default)] aria-disabled:active:[--ds-shape-fill:var(--ds-color-bg-default)]",
  "focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong",
];

type MapControlButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Forces a visual state for specimens and docs. */
  state?: "hover";
};

/** One 48px square map control. Pass a 16px glyph as the child and an `aria-label`. */
export function MapControlButton({ className, state, type = "button", ...props }: MapControlButtonProps) {
  return <button type={type} data-slot="map-control" data-state={state} className={cn(controlClasses, className)} {...props} />;
}

type MapControlsProps = React.HTMLAttributes<HTMLDivElement> & {
  onZoomIn?: React.MouseEventHandler<HTMLButtonElement>;
  onZoomOut?: React.MouseEventHandler<HTMLButtonElement>;
  /** At the closest zoom level. */
  zoomInDisabled?: boolean;
  /** At the farthest zoom level. */
  zoomOutDisabled?: boolean;
  /** Forces a visual state on both controls, for specimens and docs. */
  state?: "hover";
};

/** Zoom in and zoom out, stacked 8px apart. */
export function MapControls({
  onZoomIn,
  onZoomOut,
  zoomInDisabled,
  zoomOutDisabled,
  state,
  className,
  ...props
}: MapControlsProps) {
  return (
    <div role="group" aria-label="Zoom" data-slot="map-controls" className={cn("flex flex-col gap-1", className)} {...props}>
      <MapControlButton data-slot="zoom-in" aria-label="Zoom in" onClick={onZoomIn} disabled={zoomInDisabled} state={state}>
        <ZoomInGlyph />
      </MapControlButton>
      <MapControlButton data-slot="zoom-out" aria-label="Zoom out" onClick={onZoomOut} disabled={zoomOutDisabled} state={state}>
        <ZoomOutGlyph />
      </MapControlButton>
    </div>
  );
}

/** Plus, 16px, 1.5px stroke (Figma 443:427 "Vector_2"). */
export function ZoomInGlyph({ className, style, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden data-slot="icon" className={cn(svgBox, className)} style={svgSize(16, 16, style)} {...props}>
      <path d="M8 0V16M0 8H16" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

/** Minus, 16px, 1.5px stroke (Figma 443:430 "Vector_2"). */
export function ZoomOutGlyph({ className, style, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden data-slot="icon" className={cn(svgBox, className)} style={svgSize(16, 16, style)} {...props}>
      <path d="M0 8H16" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}
