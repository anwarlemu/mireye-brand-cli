# Chart
SVG bar, line, area and pie charts in the survey-sheet look: 1px lines, square bars, diamond points, flat fills in the chart series colors, a solid Mist grid, lines that draw in from the left like a plotter, and a cut-frame tooltip.

Install: npx mireye-ds add chart
Requires: theme, utils
Packages: none
Exports: ChartConfig, AreaChart, BarChart, ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent, LineChart, PieChart, useChart
Client boundary: yes
Reference: LAND fit-score and compare-matrix (tick and line look) and the ds-draw motion; chart series tokens from the palette (331:37)


## Usage
Use for a measure across a few categories or along a distance or time (sites per county, elevation along a parcel, interconnection requests per year). Wrap the chart in ChartContainer with a config naming each series; colors default to the series tokens in order. Add ChartTooltip with ChartTooltipContent and ChartLegend with ChartLegendContent. Use a pie only for shares of one whole with three or four parts (land use).
- Avoid: Gradients or glows
- Avoid: Lines thicker than 1px
- Avoid: Rounded bars
- Avoid: Colors outside the series tokens
- Avoid: 3D or shadowed charts
- Avoid: More than five series


## Examples
Example components: npx mireye-ds add chart
[Preview](https://mireye-ds.agencidev.com/preview/chart/Preview) | [Line](https://mireye-ds.agencidev.com/preview/chart/Line) | [Area](https://mireye-ds.agencidev.com/preview/chart/Area) | [Pie](https://mireye-ds.agencidev.com/preview/chart/Pie)

examples/chart.tsx

```tsx
"use client";

import { AreaChart, BarChart, type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, LineChart, PieChart } from "@/components/ui/chart";

const SITES = [
  { county: "Ellis", strong: 14, moderate: 9 },
  { county: "Navarro", strong: 8, moderate: 12 },
  { county: "Kaufman", strong: 6, moderate: 7 },
  { county: "Johnson", strong: 11, moderate: 5 },
  { county: "Hill", strong: 3, moderate: 8 },
  { county: "Henderson", strong: 5, moderate: 4 },
];

const config = {
  strong: { label: "Strong fit" },
  moderate: { label: "Moderate fit" },
} satisfies ChartConfig;

const short = (v: string) => v.slice(0, 4);

export function Preview() {
  return (
    <ChartContainer config={config} className="aspect-auto h-80">
      <BarChart data={SITES} index="county" tickFormatter={short} aria-label="Sites by county and fit" />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
    </ChartContainer>
  );
}

const PROFILE = [
  { mile: "0", elevation: 398 },
  { mile: "0.2", elevation: 404 },
  { mile: "0.4", elevation: 411 },
  { mile: "0.6", elevation: 409 },
  { mile: "0.8", elevation: 416 },
  { mile: "1.0", elevation: 421 },
  { mile: "1.2", elevation: 418 },
  { mile: "1.4", elevation: 412 },
];

const elevationConfig = { elevation: { label: "Elevation, ft" } } satisfies ChartConfig;

export function Line() {
  return (
    <ChartContainer config={elevationConfig} className="aspect-auto h-80">
      <LineChart data={PROFILE} index="mile" showYAxis dots aria-label="Elevation along the parcel, south to north" />
      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
      <ChartLegend content={<ChartLegendContent />} />
    </ChartContainer>
  );
}

const QUEUE = [
  { year: "2021", solar: 42, storage: 8 },
  { year: "2022", solar: 58, storage: 19 },
  { year: "2023", solar: 71, storage: 34 },
  { year: "2024", solar: 66, storage: 52 },
  { year: "2025", solar: 80, storage: 61 },
  { year: "2026", solar: 92, storage: 77 },
];

const queueConfig = { solar: { label: "Solar" }, storage: { label: "Storage" } } satisfies ChartConfig;

export function Area() {
  return (
    <ChartContainer config={queueConfig} className="aspect-auto h-80">
      <AreaChart data={QUEUE} index="year" stacked aria-label="Interconnection requests per year, stacked by type" />
      <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
      <ChartLegend content={<ChartLegendContent />} />
    </ChartContainer>
  );
}

const LAND_USE = [
  { use: "cropland", acres: 128.4 },
  { use: "pasture", acres: 61.0 },
  { use: "woodland", acres: 23.2 },
];

const landConfig = {
  cropland: { label: "Cropland", color: "var(--ds-color-chart-series-1)" },
  pasture: { label: "Pasture", color: "var(--ds-color-chart-series-3)" },
  woodland: { label: "Woodland", color: "var(--ds-color-chart-series-4)" },
} satisfies ChartConfig;

export function Pie() {
  return (
    <ChartContainer config={landConfig} className="mx-auto aspect-square max-h-72">
      <PieChart data={LAND_USE} index="use" value="acres" aria-label="Land use on Ellis County site 14, in acres" />
      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
      <ChartLegend content={<ChartLegendContent />} />
    </ChartContainer>
  );
}

```

## Source

components/ui/chart.tsx

```tsx
"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// Charts drawn in SVG, in Mireye's survey-sheet look: 1px lines everywhere (series, grid, axis), square ends, flat
// fills and no gradients or shadows. ChartContainer takes a config that names and colors each series; the colors
// default to the chart series tokens (Forest, Fern, Lichen, Clay, Bark). The grid is solid Mist with a Stone baseline,
// labels are 12px Forest at 72% with tabular figures, points are 6px diamonds, bars are square. Lines and areas draw
// in from the left at a constant speed once, on mount (ds-draw, 600ms, linear, like a plotter); bars rise from the
// axis (400ms, the strong ease-out). Under reduced motion they appear at once. Hovering or moving with the arrow keys
// shows the tooltip, a white cut-frame panel.

export type ChartConfig = Record<string, { label?: React.ReactNode; icon?: React.ComponentType<{ className?: string }>; color?: string }>;

type Datum = Record<string, string | number>;
type Active = { index: number; x: number; y: number } | null;
type ChartContextProps = {
  config: ChartConfig;
  data: Datum[];
  setData: (data: Datum[], index: string, keys: string[]) => void;
  index: string;
  keys: string[];
  active: Active;
  setActive: (active: Active) => void;
  hidden: Set<string>;
  toggle: (key: string) => void;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within a <ChartContainer />");
  return context;
}

const SERIES = ["var(--ds-color-chart-series-1)", "var(--ds-color-chart-series-2)", "var(--ds-color-chart-series-3)", "var(--ds-color-chart-series-4)", "var(--ds-color-chart-series-5)"];
const colorOf = (config: ChartConfig, key: string, i: number) => `var(--color-${key}, ${config[key]?.color ?? SERIES[i % SERIES.length]})`;

/** Kept for API parity: ChartContainer already sets each series' color as --color-<key> on itself. */
function ChartStyle(_props: { id?: string; config: ChartConfig }) {
  return null;
}

function ChartContainer({ id, className, children, config, ...props }: React.ComponentProps<"div"> & { config: ChartConfig }) {
  const [data, setDataState] = React.useState<Datum[]>([]);
  const [index, setIndex] = React.useState("");
  const [keys, setKeys] = React.useState<string[]>([]);
  const [active, setActive] = React.useState<Active>(null);
  const [hidden, setHidden] = React.useState<Set<string>>(new Set());
  const setData = React.useCallback((d: Datum[], i: string, k: string[]) => {
    setDataState(d);
    setIndex(i);
    setKeys(k);
  }, []);
  const toggle = React.useCallback((key: string) => setHidden((h) => {
    const next = new Set(h);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  }), []);
  const style = Object.fromEntries(Object.entries(config).map(([key, v], i) => [`--color-${key}`, v.color ?? SERIES[i % SERIES.length]])) as React.CSSProperties;
  return (
    <ChartContext.Provider value={{ config, data, setData, index, keys, active, setActive, hidden, toggle }}>
      <div data-slot="chart" data-chart={id} style={style} className={cn("relative flex aspect-video w-full flex-col justify-center font-sans text-caption text-fg-muted", className)} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  );
}

function useSize<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

const PAD = { top: 12, right: 12, bottom: 28, left: 12 };

function niceMax(max: number) {
  if (max <= 0) return 1;
  const step = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / step) * step;
}

/** A smooth path through the points (monotone in x), or straight segments. */
function pathOf(points: [number, number][], curve: "monotone" | "linear") {
  if (!points.length) return "";
  if (curve === "linear" || points.length < 3) return points.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join("");
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i - 1] ?? points[i];
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const [x3, y3] = points[i + 2] ?? points[i + 1];
    const c1 = [x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6];
    const c2 = [x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6];
    d += `C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${x2},${y2}`;
  }
  return d;
}

type CartesianProps = {
  data: Datum[];
  /** The key of each datum's label on the x axis (month, day). */
  index: string;
  /** The series to draw, in order; defaults to every key in the config. */
  keys?: string[];
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  /** Format the x labels (e.g. the first three letters of a month). */
  tickFormatter?: (value: string) => string;
  valueFormatter?: (value: number) => string;
  className?: string;
  "aria-label"?: string;
};

function useCartesian(kind: "line" | "area" | "bar", { data, index, keys: keysProp, showYAxis }: CartesianProps, stacked: boolean) {
  const chart = useChart();
  const keys = React.useMemo(() => keysProp ?? Object.keys(chart.config), [keysProp, chart.config]);
  const { setData } = chart;
  React.useEffect(() => setData(data, index, keys), [data, index, keys, setData]);
  const [ref, size] = useSize<HTMLDivElement>();
  const visible = keys.filter((k) => !chart.hidden.has(k));
  const values = data.map((d) => (stacked ? visible.reduce((s, k) => s + Number(d[k] ?? 0), 0) : Math.max(0, ...visible.map((k) => Number(d[k] ?? 0)))));
  const max = niceMax(Math.max(0, ...values));
  const left = PAD.left + (showYAxis ? 32 : 0);
  const innerW = Math.max(0, size.width - left - PAD.right);
  // Lines and areas keep their first and last points (and labels) clear of the edges.
  const inset = kind === "bar" ? 0 : 16;
  const innerH = Math.max(0, size.height - PAD.top - PAD.bottom);
  const band = data.length ? innerW / data.length : 0;
  const xAt = (i: number) => (kind === "bar" ? left + band * i + band / 2 : left + inset + (data.length > 1 ? ((innerW - inset * 2) * i) / (data.length - 1) : innerW / 2 - inset));
  const yAt = (v: number) => PAD.top + innerH - (innerH * v) / max;
  return { chart, keys, visible, ref, size, max, left, innerW, innerH, band, xAt, yAt };
}

function Frame({ kind, props, geometry, children }: { kind: "line" | "area" | "bar"; props: CartesianProps; geometry: ReturnType<typeof useCartesian>; children: React.ReactNode }) {
  const { chart, ref, size, max, left, innerW, innerH, band, xAt, yAt } = geometry;
  const { data, index, showGrid = true, showXAxis = true, showYAxis = false, tickFormatter = (v: string) => v, valueFormatter = (v: number) => v.toLocaleString() } = props;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => max * t);
  const pick = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    let best = 0;
    for (let i = 0; i < data.length; i++) if (Math.abs(xAt(i) - x) < Math.abs(xAt(best) - x)) best = i;
    return best;
  };
  const activate = (i: number) => chart.setActive({ index: i, x: xAt(i), y: PAD.top });
  const labelStep = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(innerW / 56))));
  return (
    <div ref={ref} className={cn("relative h-full min-h-0 w-full flex-1", props.className)}>
      {size.width > 0 && (
        <svg
          width={size.width}
          height={size.height}
          role="img"
          tabIndex={0}
          aria-label={props["aria-label"] ?? "Chart"}
          className="block overflow-visible outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong"
          onPointerMove={(e) => activate(pick(e.clientX, e.currentTarget.getBoundingClientRect()))}
          onPointerLeave={() => chart.setActive(null)}
          onBlur={() => chart.setActive(null)}
          onFocus={() => activate(chart.active?.index ?? 0)}
          onKeyDown={(e) => {
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();
            const current = chart.active?.index ?? 0;
            activate(Math.min(data.length - 1, Math.max(0, current + (e.key === "ArrowRight" ? 1 : -1))));
          }}
        >
          {showGrid && ticks.map((t) => <line key={t} x1={left} x2={left + innerW} y1={yAt(t)} y2={yAt(t)} className={t === 0 ? "stroke-line" : "stroke-line-subtle"} strokeWidth={1} shapeRendering="crispEdges" />)}
          {showYAxis && ticks.map((t) => (
            <text key={t} x={left - 8} y={yAt(t)} dy="0.32em" textAnchor="end" className="fill-fg-muted text-caption tabular-nums">
              {valueFormatter(t)}
            </text>
          ))}
          {chart.active && kind !== "bar" && <line x1={xAt(chart.active.index)} x2={xAt(chart.active.index)} y1={PAD.top} y2={PAD.top + innerH} className="stroke-line" strokeWidth={1} shapeRendering="crispEdges" />}
          {chart.active && kind === "bar" && <rect x={xAt(chart.active.index) - band / 2} y={PAD.top} width={band} height={innerH} className="fill-subtle" />}
          {children}
          {showXAxis && data.map((d, i) => (i % labelStep === 0 ? (
            <text key={i} x={xAt(i)} y={PAD.top + innerH + 18} textAnchor="middle" className="fill-fg-muted text-caption tabular-nums">
              {tickFormatter(String(d[index]))}
            </text>
          ) : null))}
        </svg>
      )}
    </div>
  );
}

function LineChart(props: CartesianProps & { curve?: "monotone" | "linear"; dots?: boolean }) {
  const g = useCartesian("line", props, false);
  const { curve = "monotone", dots = false } = props;
  return (
    <Frame kind="line" props={props} geometry={g}>
      {g.visible.map((key) => {
        const i = g.keys.indexOf(key);
        const points = props.data.map((d, n) => [g.xAt(n), g.yAt(Number(d[key] ?? 0))] as [number, number]);
        return (
          <g key={key} data-series={key}>
            <path d={pathOf(points, curve)} fill="none" stroke={colorOf(g.chart.config, key, i)} strokeWidth={1} strokeLinejoin="round" className="motion-safe:animate-[ds-draw_600ms_linear_both]" />
            {(dots || g.chart.active) && points.map(([x, y], n) => (dots || g.chart.active?.index === n ? <rect key={n} x={x - 3} y={y - 3} width={6} height={6} transform={`rotate(45 ${x} ${y})`} fill={g.chart.active?.index === n ? colorOf(g.chart.config, key, i) : "var(--ds-color-bg-default)"} stroke={colorOf(g.chart.config, key, i)} strokeWidth={1} /> : null))}
          </g>
        );
      })}
    </Frame>
  );
}

function AreaChart(props: CartesianProps & { curve?: "monotone" | "linear"; stacked?: boolean }) {
  const { curve = "monotone", stacked = false } = props;
  const g = useCartesian("area", props, stacked);
  const base = props.data.map(() => 0);
  return (
    <Frame kind="area" props={props} geometry={g}>
      {g.visible.map((key) => {
        const i = g.keys.indexOf(key);
        const lows = stacked ? [...base] : props.data.map(() => 0);
        const highs = props.data.map((d, n) => lows[n] + Number(d[key] ?? 0));
        if (stacked) highs.forEach((h, n) => (base[n] = h));
        const top = highs.map((v, n) => [g.xAt(n), g.yAt(v)] as [number, number]);
        const bottom = lows.map((v, n) => [g.xAt(n), g.yAt(v)] as [number, number]).reverse();
        const line = pathOf(top, curve);
        const area = `${line}L${bottom.map(([x, y]) => `${x},${y}`).join("L")}Z`;
        return (
          <g key={key} data-series={key} className="motion-safe:animate-[ds-draw_600ms_linear_both]">
            <path d={area} fill={colorOf(g.chart.config, key, i)} fillOpacity={0.14} />
            <path d={line} fill="none" stroke={colorOf(g.chart.config, key, i)} strokeWidth={1} strokeLinejoin="round" />
          </g>
        );
      })}
    </Frame>
  );
}

function BarChart(props: CartesianProps & { stacked?: boolean; radius?: number }) {
  const { stacked = false, radius = 0 } = props;
  const g = useCartesian("bar", props, stacked);
  const gap = 4;
  const groupW = Math.max(0, g.band * 0.72);
  const barW = stacked ? groupW : Math.max(2, (groupW - gap * (g.visible.length - 1)) / Math.max(1, g.visible.length));
  return (
    <Frame kind="bar" props={props} geometry={g}>
      {props.data.map((d, n) => {
        let acc = 0;
        return (
          <g key={n}>
            {g.visible.map((key, k) => {
              const value = Number(d[key] ?? 0);
              const x = stacked ? g.xAt(n) - groupW / 2 : g.xAt(n) - groupW / 2 + k * (barW + gap);
              const y0 = g.yAt(acc);
              const y1 = g.yAt(acc + value);
              if (stacked) acc += value;
              const top = !stacked || k === g.visible.length - 1;
              return (
                <rect
                  key={key}
                  x={x}
                  y={y1}
                  width={barW}
                  height={Math.max(0, y0 - y1)}
                  rx={top ? Math.min(radius, barW / 2) : 0}
                  fill={colorOf(g.chart.config, key, g.keys.indexOf(key))}
                  style={{ transformOrigin: `0 ${g.yAt(0)}px`, animationDelay: `${n * 30}ms` }}
                  className="motion-safe:animate-chart-bar"
                />
              );
            })}
          </g>
        );
      })}
    </Frame>
  );
}

function PieChart({ data, index, value, innerRadius = 0.6, className, ...props }: { data: Datum[]; index: string; value: string; innerRadius?: number; className?: string; "aria-label"?: string }) {
  const chart = useChart();
  const { setData } = chart;
  React.useEffect(() => setData(data, index, [value]), [data, index, value, setData]);
  const [ref, size] = useSize<HTMLDivElement>();
  const shown = data.filter((d) => !chart.hidden.has(String(d[index])));
  const total = shown.reduce((s, d) => s + Number(d[value] ?? 0), 0) || 1;
  const r = Math.max(0, Math.min(size.width, size.height) / 2 - 8);
  const cx = size.width / 2;
  const cy = size.height / 2;
  let angle = -Math.PI / 2;
  return (
    <div ref={ref} className={cn("relative h-full min-h-0 w-full flex-1", className)}>
      {r > 0 && (
        <svg width={size.width} height={size.height} role="img" aria-label={props["aria-label"] ?? "Chart"} className="block origin-center motion-safe:animate-pop-in" onPointerLeave={() => chart.setActive(null)}>
          {shown.map((d) => {
            const key = String(d[index]);
            const n = data.indexOf(d);
            const sweep = (Number(d[value] ?? 0) / total) * Math.PI * 2;
            const a0 = angle;
            const a1 = angle + sweep;
            angle = a1;
            const ri = r * innerRadius;
            const large = sweep > Math.PI ? 1 : 0;
            const p = (a: number, rr: number) => `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
            const dPath = sweep >= Math.PI * 2 - 1e-6
              ? `M${cx - r},${cy}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 ${-r * 2},0${ri ? `M${cx - ri},${cy}a${ri},${ri} 0 1,1 ${ri * 2},0a${ri},${ri} 0 1,1 ${-ri * 2},0` : ""}`
              : `M${p(a0, r)}A${r},${r} 0 ${large} 1 ${p(a1, r)}${ri ? `L${p(a1, ri)}A${ri},${ri} 0 ${large} 0 ${p(a0, ri)}` : `L${cx},${cy}`}Z`;
            return (
              <path
                key={key}
                d={dPath}
                fillRule="evenodd"
                fill={colorOf(chart.config, key, n)}
                stroke="var(--ds-color-bg-default)"
                strokeWidth={1}
                className={cn("transition-opacity duration-150 ease-out", chart.active && chart.active.index !== n && "opacity-60")}
                onPointerMove={(e) => {
                  const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
                  chart.setActive({ index: n, x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
}

type TooltipItem = { key: string; name: React.ReactNode; value: number; color: string };

/** Where the tooltip shows: pass `content` (usually <ChartTooltipContent />). It follows the hovered point. */
function ChartTooltip({ content, cursor: _cursor }: { content?: React.ReactElement<ChartTooltipContentProps>; cursor?: boolean }) {
  const chart = useChart();
  if (!chart.active || !chart.data.length) return null;
  const datum = chart.data[chart.active.index];
  if (!datum) return null;
  const pie = chart.keys.length === 1 && !(chart.keys[0] in chart.config) && String(datum[chart.index]) in chart.config;
  const payload: TooltipItem[] = pie
    ? [{ key: String(datum[chart.index]), name: chart.config[String(datum[chart.index])]?.label ?? String(datum[chart.index]), value: Number(datum[chart.keys[0]] ?? 0), color: colorOf(chart.config, String(datum[chart.index]), chart.active.index) }]
    : chart.keys.filter((k) => !chart.hidden.has(k)).map((k, i) => ({ key: k, name: chart.config[k]?.label ?? k, value: Number(datum[k] ?? 0), color: colorOf(chart.config, k, chart.keys.indexOf(k) ?? i) }));
  const element = content ?? <ChartTooltipContent />;
  return (
    <div
      data-slot="chart-tooltip"
      role="status"
      className="pointer-events-none absolute z-10 animate-fade-in"
      style={{ left: chart.active.x, top: chart.active.y, transform: `translate(${chart.active.x > 160 ? "calc(-100% - 12px)" : "12px"}, 0)` }}
    >
      {React.cloneElement(element, { payload, label: pie ? undefined : String(datum[chart.index]) })}
    </div>
  );
}

type ChartTooltipContentProps = React.ComponentProps<"div"> & {
  payload?: TooltipItem[];
  label?: string;
  indicator?: "dot" | "line" | "dashed";
  hideLabel?: boolean;
  hideIndicator?: boolean;
  labelFormatter?: (label: string) => React.ReactNode;
  formatter?: (value: number, name: React.ReactNode, key: string) => React.ReactNode;
};

/** The tooltip's panel: the white cut frame with the 1px Stone line, the label in 12px medium Forest, a row per series. */
function ChartTooltipContent({ payload = [], label, indicator = "dot", hideLabel = false, hideIndicator = false, labelFormatter, formatter, className, ...props }: ChartTooltipContentProps) {
  return (
    <div data-slot="chart-tooltip-content" className={cn("ds-cut-frame grid min-w-32 gap-1.5 px-3 py-2 text-caption leading-tight text-fg [--ds-cut:var(--ds-cut-sm)] [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]", className)} {...props}>
      {!hideLabel && label !== undefined && <p className="text-caption font-medium text-fg">{labelFormatter ? labelFormatter(label) : label}</p>}
      <div className="grid gap-1">
        {payload.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            {!hideIndicator && (
              <span
                aria-hidden
                className={cn("shrink-0", indicator === "dot" ? "size-2" : "h-3 w-px", indicator === "dashed" && "w-1 border border-dashed bg-transparent")}
                style={indicator === "dashed" ? { borderColor: item.color } : { background: item.color }}
              />
            )}
            {formatter ? formatter(item.value, item.name, item.key) : (
              <>
                <span className="text-fg-muted">{item.name}</span>
                <span className="ml-auto pl-3 font-medium text-fg tabular-nums">{item.value.toLocaleString()}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Where the legend shows: pass `content` (usually <ChartLegendContent />). */
function ChartLegend({ content, verticalAlign = "bottom" }: { content?: React.ReactElement<React.ComponentProps<typeof ChartLegendContent>>; verticalAlign?: "top" | "bottom" }) {
  const element = content ?? <ChartLegendContent />;
  return <div className={cn(verticalAlign === "top" ? "order-first pb-3" : "pt-3")}>{element}</div>;
}

/** A row of 12px muted labels with their color keys; each toggles its series when `interactive`. */
function ChartLegendContent({ className, hideIcon = false, interactive = true, ...props }: React.ComponentProps<"div"> & { hideIcon?: boolean; interactive?: boolean }) {
  const chart = useChart();
  const keys = chart.keys.length === 1 && !(chart.keys[0] in chart.config) ? chart.data.map((d) => String(d[chart.index])) : chart.keys;
  return (
    <div data-slot="chart-legend-content" className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5", className)} {...props}>
      {keys.map((key, i) => {
        const item = chart.config[key];
        const Icon = item?.icon;
        const off = chart.hidden.has(key);
        const body = (
          <>
            {Icon && !hideIcon ? <Icon className="size-3.5" /> : <span aria-hidden className="size-2" style={{ background: colorOf(chart.config, key, i) }} />}
            {item?.label ?? key}
          </>
        );
        return interactive ? (
          <button key={key} type="button" aria-pressed={!off} onClick={() => chart.toggle(key)} className={cn("inline-flex cursor-pointer items-center gap-1.5 text-caption leading-tight text-fg-secondary outline-none transition-opacity duration-150 ease-out focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong motion-reduce:transition-none", off && "opacity-40")}>
            {body}
          </button>
        ) : (
          <span key={key} className="inline-flex items-center gap-1.5 text-caption leading-tight text-fg-secondary">
            {body}
          </span>
        );
      })}
    </div>
  );
}

export { AreaChart, BarChart, ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent, LineChart, PieChart, useChart };

```
