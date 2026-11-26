# Calendar
A month grid of square 36px day keys: Fog under the pointer, Forest for the chosen day, a Fog band across a range, Slate outside days, and a small Forest diamond under today.

Install: npx mireye-ds add calendar
Requires: theme, diamond, utils
Packages: @phosphor-icons/react
Exports: Calendar, CalendarDayButton, CalendarProps, DateRange
Client boundary: yes
Reference: Not in Figma. Drawn in Mireye's grammar: the Diamond node of Figma UI · Status and tags (442:177) for today


## Usage
Use inside the date picker, or on its own where a month is always in view (a site visit schedule). Supports single days, several days and ranges.
- Avoid: Rounded day keys
- Avoid: Animating the change of month
- Avoid: A circle to mark today


## Examples
Example components: npx mireye-ds add calendar
[Preview](https://mireye-ds.agencidev.com/preview/calendar/Preview) | [Range](https://mireye-ds.agencidev.com/preview/calendar/Range) | [Multiple](https://mireye-ds.agencidev.com/preview/calendar/Multiple) | [Disabled](https://mireye-ds.agencidev.com/preview/calendar/Disabled) | [Dropdown](https://mireye-ds.agencidev.com/preview/calendar/Dropdown)

examples/calendar.tsx

```tsx
"use client";

import * as React from "react";

import { Calendar, type DateRange } from "@/components/ui/calendar";

const TODAY = new Date(2026, 7, 8);
const FRAME = "ds-cut-frame w-fit [--ds-cut:var(--ds-cut-md)] [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]";

export function Preview() {
  const [date, setDate] = React.useState<Date | undefined>(TODAY);
  return <Calendar mode="single" selected={date} onSelect={setDate} today={TODAY} className={FRAME} />;
}

export function Range() {
  const [range, setRange] = React.useState<DateRange | undefined>({ from: new Date(2026, 7, 4), to: new Date(2026, 7, 12) });
  return <Calendar mode="range" selected={range} onSelect={setRange} today={TODAY} numberOfMonths={2} className={FRAME} />;
}

export function Multiple() {
  const [days, setDays] = React.useState<Date[]>([new Date(2026, 7, 3), new Date(2026, 7, 10), new Date(2026, 7, 17)]);
  return <Calendar mode="multiple" selected={days} onSelect={setDays} today={TODAY} weekStartsOn={1} className={FRAME} />;
}

export function Disabled() {
  const [date, setDate] = React.useState<Date | undefined>();
  return <Calendar mode="single" selected={date} onSelect={setDate} today={TODAY} disabled={[{ before: TODAY }, { dayOfWeek: [0, 6] }]} showOutsideDays={false} className={FRAME} />;
}

export function Dropdown() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(1994, 4, 21));
  return <Calendar mode="single" selected={date} onSelect={setDate} today={TODAY} captionLayout="dropdown" fromYear={1940} toYear={2026} className={FRAME} />;
}

```

## Source

components/ui/calendar.tsx

```tsx
"use client";

import * as React from "react";
import { CaretDownIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/ssr";

import { Diamond } from "@/components/ui/diamond";
import { cn } from "@/lib/utils";

// A month grid. Figma has none, so it is drawn in Mireye's grammar: the caption is 13px medium Forest between two square
// 32px caret keys; weekdays are 12px muted; days are square 36px keys with 13px Forest numerals (tabular), Fog under the
// pointer and Mist while pressed. Today carries a small Forest diamond under its numeral (Mireye's node); a selected
// day is a Forest key with white text (the diamond turns white); the days inside a range sit on a Fog band between its
// two Forest ends; days of the next and last month are Slate, and disabled ones Slate and struck through. Arrow keys
// move a day or a week, Home and End go to the week's ends, Page Up and Page Down change the month (with Shift, the
// year), Enter or Space selects. Changing month is instant: it happens many times in a row.

type DateRange = { from: Date | undefined; to?: Date | undefined };
type Matcher = Date | Date[] | ((date: Date) => boolean) | { before?: Date; after?: Date } | { from: Date; to: Date } | { dayOfWeek: number[] };

type CommonProps = {
  /** The month shown first (controlled). */
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  numberOfMonths?: number;
  /** Show the days of the months before and after in the grid (default true). */
  showOutsideDays?: boolean;
  /** 0 is Sunday (default), 1 is Monday. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  disabled?: Matcher | Matcher[];
  /** "label" (the default) or "dropdown": month and year selects in the caption. */
  captionLayout?: "label" | "dropdown";
  fromYear?: number;
  toYear?: number;
  /** Today, for the marker (defaults to the current date). */
  today?: Date;
  locale?: string;
  className?: string;
  autoFocus?: boolean;
};

type SingleProps = { mode?: "single"; selected?: Date; onSelect?: (date: Date | undefined) => void; required?: boolean };
type MultipleProps = { mode: "multiple"; selected?: Date[]; onSelect?: (dates: Date[]) => void; max?: number };
type RangeProps = { mode: "range"; selected?: DateRange; onSelect?: (range: DateRange | undefined) => void; min?: number; max?: number };

type CalendarProps = CommonProps & (SingleProps | MultipleProps | RangeProps);

const day0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a?: Date, b?: Date) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), last));
};
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const diffDays = (a: Date, b: Date) => Math.round((day0(a).getTime() - day0(b).getTime()) / 86_400_000);

function matches(date: Date, matcher: Matcher): boolean {
  if (matcher instanceof Date) return sameDay(date, matcher);
  if (Array.isArray(matcher)) return matcher.some((d) => sameDay(date, d));
  if (typeof matcher === "function") return matcher(date);
  if ("dayOfWeek" in matcher) return matcher.dayOfWeek.includes(date.getDay());
  if ("from" in matcher && "to" in matcher) return diffDays(date, matcher.from) >= 0 && diffDays(matcher.to, date) >= 0;
  const m = matcher as { before?: Date; after?: Date };
  return (!!m.before && diffDays(date, m.before) < 0) || (!!m.after && diffDays(date, m.after) > 0);
}

/** The weeks shown for a month: whole weeks from the one holding the 1st. */
function weeksOf(month: Date, weekStartsOn: number) {
  const first = startOfMonth(month);
  const start = addDays(first, -((first.getDay() - weekStartsOn + 7) % 7));
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const week = Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i));
    if (w > 3 && week[0].getMonth() !== month.getMonth()) break;
    weeks.push(week);
  }
  return weeks;
}

function Calendar(props: CalendarProps) {
  const { month: monthProp, defaultMonth, onMonthChange, numberOfMonths = 1, showOutsideDays = true, weekStartsOn = 0, disabled, captionLayout = "label", fromYear, toYear, locale, className, autoFocus } = props;
  const today = React.useMemo(() => day0(props.today ?? new Date()), [props.today]);
  const initial = (() => {
    if (props.mode === "range") return props.selected?.from;
    if (props.mode === "multiple") return props.selected?.[0];
    return props.selected;
  })();
  const [monthState, setMonthState] = React.useState(() => startOfMonth(defaultMonth ?? initial ?? today));
  const month = monthProp ? startOfMonth(monthProp) : monthState;
  const setMonth = (m: Date) => {
    const next = startOfMonth(m);
    if (!monthProp) setMonthState(next);
    onMonthChange?.(next);
  };
  const [focused, setFocused] = React.useState<Date | undefined>(undefined);
  const grid = React.useRef<HTMLDivElement>(null);
  const focusPending = React.useRef(!!autoFocus);

  const isDisabled = (d: Date) => (disabled ? (Array.isArray(disabled) && !(disabled[0] instanceof Date) ? (disabled as Matcher[]).some((m) => matches(d, m)) : matches(d, disabled as Matcher)) : false);

  const state = (d: Date) => {
    if (props.mode === "range") {
      const { from, to } = props.selected ?? { from: undefined };
      const start = sameDay(d, from);
      const end = sameDay(d, to ?? from);
      const middle = !!from && !!to && diffDays(d, from) > 0 && diffDays(to, d) > 0;
      return { selected: start || end || middle, start: start && !!to && !sameDay(from, to), end: end && !!to && !sameDay(from, to), middle };
    }
    if (props.mode === "multiple") return { selected: !!props.selected?.some((s) => sameDay(s, d)), start: false, end: false, middle: false };
    return { selected: sameDay(props.selected, d), start: false, end: false, middle: false };
  };

  const select = (d: Date) => {
    if (isDisabled(d)) return;
    if (props.mode === "range") {
      const cur = props.selected;
      if (!cur?.from || cur.to) {
        props.onSelect?.({ from: d, to: undefined });
        return;
      }
      const [from, to] = diffDays(d, cur.from) < 0 ? [d, cur.from] : [cur.from, d];
      const length = diffDays(to, from);
      if ((props.max && length > props.max) || (props.min && length < props.min)) {
        props.onSelect?.({ from: d, to: undefined });
        return;
      }
      props.onSelect?.({ from, to });
    } else if (props.mode === "multiple") {
      const cur = props.selected ?? [];
      const has = cur.some((s) => sameDay(s, d));
      if (has) props.onSelect?.(cur.filter((s) => !sameDay(s, d)));
      else if (!props.max || cur.length < props.max) props.onSelect?.([...cur, d]);
    } else {
      const p = props as SingleProps;
      p.onSelect?.(sameDay(p.selected, d) && !p.required ? undefined : d);
    }
    if (d.getMonth() !== month.getMonth() && numberOfMonths === 1) setMonth(d);
  };

  // The day that takes Tab focus in the grid: the focused day, else the selection, else today, else the 1st.
  const months = Array.from({ length: numberOfMonths }, (_, i) => addMonths(month, i));
  const inView = (d: Date) => months.some((m) => m.getMonth() === d.getMonth() && m.getFullYear() === d.getFullYear());
  const tabDay = [focused, initial, today, month].find((d) => d && inView(d))!;

  // Focus the moved-to day, or with autoFocus the day that takes Tab focus (the selection, else today) on mount.
  const target = focused ?? tabDay;
  React.useEffect(() => {
    if (!focusPending.current || !target) return;
    focusPending.current = false;
    grid.current?.querySelector<HTMLButtonElement>(`[data-day="${target.toDateString()}"]`)?.focus();
  }, [target, month]);

  const move = (d: Date) => {
    if (!inView(d)) setMonth(diffDays(d, month) < 0 ? d : addMonths(d, -(numberOfMonths - 1)));
    focusPending.current = true;
    setFocused(d);
  };

  const onKeyDown = (event: React.KeyboardEvent, d: Date) => {
    const weekStart = addDays(d, -((d.getDay() - weekStartsOn + 7) % 7));
    const keys: Record<string, () => Date> = {
      ArrowLeft: () => addDays(d, -1),
      ArrowRight: () => addDays(d, 1),
      ArrowUp: () => addDays(d, -7),
      ArrowDown: () => addDays(d, 7),
      Home: () => weekStart,
      End: () => addDays(weekStart, 6),
      PageUp: () => addMonths(d, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(d, event.shiftKey ? 12 : 1),
    };
    const next = keys[event.key];
    if (!next) return;
    event.preventDefault();
    move(next());
  };

  const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, opts);
  const weekdayNames = Array.from({ length: 7 }, (_, i) => addDays(new Date(2023, 0, 1 + weekStartsOn), i));
  const years = (() => {
    const from = fromYear ?? today.getFullYear() - 100;
    const to = toYear ?? today.getFullYear() + 10;
    return Array.from({ length: to - from + 1 }, (_, i) => from + i);
  })();

  return (
    <div data-slot="calendar" className={cn("w-fit p-3 font-sans text-fg", className)}>
      <div ref={grid} className="flex flex-col gap-4 sm:flex-row">
        {months.map((m, index) => (
          <div key={m.toISOString()} data-slot="calendar-month" className="flex flex-col gap-3">
            <div data-slot="calendar-caption" className="relative flex h-8 items-center justify-center">
              {index === 0 && (
                <button type="button" aria-label="Go to the previous month" onClick={() => setMonth(addMonths(month, -1))} className={NAV_BUTTON + " absolute left-0"}>
                  <CaretLeftIcon />
                </button>
              )}
              {captionLayout === "dropdown" && index === 0 ? (
                <div className="flex items-center gap-1.5">
                  <CaptionSelect label="Month" value={m.getMonth()} onChange={(v) => setMonth(new Date(m.getFullYear(), v, 1))} options={Array.from({ length: 12 }, (_, i) => ({ value: i, label: fmt({ month: "short" }).format(new Date(2023, i, 1)) }))} />
                  <CaptionSelect label="Year" value={m.getFullYear()} onChange={(v) => setMonth(new Date(v, m.getMonth(), 1))} options={years.map((y) => ({ value: y, label: String(y) }))} />
                </div>
              ) : (
                <p aria-live="polite" className="text-body leading-tight font-medium text-fg">
                  {fmt({ month: "long", year: "numeric" }).format(m)}
                </p>
              )}
              {index === months.length - 1 && (
                <button type="button" aria-label="Go to the next month" onClick={() => setMonth(addMonths(month, 1))} className={NAV_BUTTON + " absolute right-0"}>
                  <CaretRightIcon />
                </button>
              )}
            </div>
            <table role="grid" aria-label={fmt({ month: "long", year: "numeric" }).format(m)} className="border-collapse">
              <thead>
                <tr>
                  {weekdayNames.map((w) => (
                    <th key={w.getDay()} scope="col" aria-label={fmt({ weekday: "long" }).format(w)} className="size-9 p-0 text-caption leading-tight font-normal text-fg-muted">
                      {fmt({ weekday: "short" }).format(w).slice(0, 2)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeksOf(m, weekStartsOn).map((week) => (
                  <tr key={week[0].toISOString()} className="mt-0.5">
                    {week.map((d) => {
                      const outside = d.getMonth() !== m.getMonth();
                      if (outside && !showOutsideDays) return <td key={d.toISOString()} className="size-9 p-0" />;
                      const s = state(d);
                      const off = isDisabled(d);
                      return (
                        <td
                          key={d.toISOString()}
                          role="gridcell"
                          aria-selected={s.selected || undefined}
                          data-range-start={s.start || undefined}
                          data-range-end={s.end || undefined}
                          data-range-middle={s.middle || undefined}
                          className="relative size-9 p-0 py-0.5 text-center data-range-end:bg-[linear-gradient(to_left,transparent_50%,var(--ds-color-bg-subtle)_50%)] data-range-middle:bg-subtle data-range-start:bg-[linear-gradient(to_right,transparent_50%,var(--ds-color-bg-subtle)_50%)] data-range-start:[background-clip:content-box] data-range-end:[background-clip:content-box] data-range-middle:[background-clip:content-box]"
                        >
                          <CalendarDayButton
                            date={d}
                            label={fmt({ weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(d)}
                            today={sameDay(d, today)}
                            outside={outside}
                            disabled={off}
                            selected={s.selected && !s.middle}
                            middle={s.middle}
                            tabIndex={sameDay(d, tabDay) && !outside ? 0 : -1}
                            onClick={() => select(d)}
                            onFocus={() => setFocused(d)}
                            onKeyDown={(e) => onKeyDown(e, d)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

const NAV_BUTTON =
  "inline-flex size-8 items-center justify-center text-fg outline-none transition-[background-color] duration-150 ease-out hover:bg-subtle active:bg-subtle-hover active:duration-0 focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong motion-reduce:transition-none [&_svg]:size-4";

function CaptionSelect({ label, value, options, onChange }: { label: string; value: number; options: { value: number; label: string }[]; onChange: (value: number) => void }) {
  return (
    <span className="relative inline-flex">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 appearance-none border border-line bg-surface pr-7 pl-2.5 font-sans text-body leading-tight font-medium text-fg outline-none focus-visible:border-line-strong"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <CaretDownIcon aria-hidden className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-fg" />
    </span>
  );
}

type DayButtonProps = Omit<React.ComponentProps<"button">, "children"> & { date: Date; label: string; today?: boolean; outside?: boolean; selected?: boolean; middle?: boolean };

/** One day: a square 36px key. Exported so an app can render a day its own way inside the same grid. */
function CalendarDayButton({ date, label, today, outside, selected, middle, disabled, className, ...props }: DayButtonProps) {
  return (
    <button
      type="button"
      data-slot="calendar-day"
      data-day={date.toDateString()}
      data-today={today || undefined}
      data-outside={outside || undefined}
      data-selected={selected || undefined}
      data-range-middle={middle || undefined}
      aria-label={label}
      aria-pressed={selected || middle || undefined}
      aria-current={today ? "date" : undefined}
      disabled={disabled}
      className={cn(
        "relative mx-auto flex size-9 items-center justify-center font-sans text-body leading-tight text-fg tabular-nums outline-none transition-[background-color,color] duration-150 ease-out hover:bg-subtle active:bg-subtle-hover active:duration-0 focus-visible:z-10 focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-line-strong disabled:pointer-events-none disabled:text-fg-subtle disabled:line-through motion-reduce:transition-none",
        today && "font-medium",
        outside && "text-fg-subtle",
        middle && "bg-transparent text-fg hover:bg-subtle-hover",
        selected && "bg-inverse text-fg-inverse hover:bg-primary-hover active:bg-inverse",
        className,
      )}
      {...props}
    >
      {date.getDate()}
      {today && <Diamond size={8} className="absolute bottom-1 left-1/2 -translate-x-1/2" />}
    </button>
  );
}

export { Calendar, CalendarDayButton };
export type { CalendarProps, DateRange };

```
