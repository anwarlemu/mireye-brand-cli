"use client";

import * as React from "react";
import { CalendarBlankIcon, CaretDownIcon } from "@phosphor-icons/react/ssr";

import { CheckIcon } from "@/components/icons/check";

import { Calendar, type CalendarProps, type DateRange } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// A date field. Figma has none, so it is drawn in Mireye's grammar. The trigger is a 36px field (Figma "UI · Inputs"
// 442:107 at the product scale): the white frame with the 8px cut corner and a 1px Stone line that turns Forest with
// keyboard focus (brick when invalid), a 16px calendar glyph in the secondary ink, the date in 13px Forest (the
// placeholder in the muted ink) and a still caret at the right. The calendar opens 8px under it in the popover's panel
// (white, the 6px cut corner, a 1px Stone line, no shadow), growing from the trigger (98 percent and a fade, 150ms).
// Presets sit in a column of the menu's square 32px rows at the panel's left, behind a Mist rule (Fog under the pointer,
// Mist while pressed); the chosen one ends in Mireye's check. A single date closes the panel when picked; a range closes
// once both ends are set. Opening puts focus on the chosen day (or today), so the arrow keys work at once.
const TRIGGER =
  "ds-cut-frame flex h-9 w-full min-w-0 cursor-pointer items-center gap-2 px-3 font-sans text-body leading-tight whitespace-nowrap text-fg outline-none [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] focus-visible:[--ds-shape-stroke:var(--ds-color-border-strong)] aria-invalid:[--ds-shape-stroke:var(--ds-color-status-danger)] disabled:cursor-not-allowed disabled:text-fg-subtle disabled:[--ds-shape-fill:var(--ds-color-bg-subtle-hover)] data-[empty=true]:text-fg-muted";

type Preset<T> = { label: string; value: T };

function formatDate(date: Date, locale?: string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

function formatRange(range: DateRange | undefined, locale?: string) {
  if (!range?.from) return undefined;
  if (!range.to) return `${formatDate(range.from, locale)} -`;
  const sameYear = range.from.getFullYear() === range.to.getFullYear();
  return `${formatDate(range.from, locale, sameYear ? { month: "short", day: "numeric" } : undefined)} - ${formatDate(range.to, locale)}`;
}

function DatePickerTrigger({ empty, label, className, children, ...props }: React.ComponentProps<"button"> & { empty: boolean; label?: string }) {
  return (
    <PopoverTrigger asChild>
      <button type="button" data-slot="date-picker-trigger" data-empty={empty} aria-label={label} className={cn(TRIGGER, className)} {...props}>
        <CalendarBlankIcon aria-hidden className="size-4 shrink-0 text-fg-secondary" />
        <span className="min-w-0 flex-1 truncate text-left">{children}</span>
        <CaretDownIcon aria-hidden className="size-4 shrink-0 text-fg" />
      </button>
    </PopoverTrigger>
  );
}

function Presets<T>({ presets, isActive, onPick }: { presets: Preset<T>[]; isActive: (p: Preset<T>) => boolean; onPick: (value: T) => void }) {
  return (
    <div data-slot="date-picker-presets" role="group" aria-label="Presets" className="flex overflow-x-auto border-line-subtle p-1 max-sm:border-b sm:w-40 sm:flex-col sm:border-r">
      {presets.map((p) => (
        <button
          key={p.label}
          type="button"
          aria-pressed={isActive(p)}
          onClick={() => onPick(p.value)}
          className="flex h-8 shrink-0 items-center gap-2 px-3 text-left font-sans text-body leading-tight font-normal whitespace-nowrap text-fg outline-none hover:bg-subtle active:bg-subtle-hover focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-line-strong"
        >
          {p.label}
          {isActive(p) && <CheckIcon className="ml-auto" />}
        </button>
      ))}
    </div>
  );
}

const sameDay = (a?: Date, b?: Date) => !!a && !!b && a.toDateString() === b.toDateString();

type CalendarPassThrough = Omit<CalendarProps, "mode" | "selected" | "onSelect" | "required" | "min" | "max">;

type DatePickerProps = {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Shortcuts beside the calendar (Today, In a week). */
  presets?: Preset<Date>[];
  /** Props for the calendar inside (disabled days, the first day of the week, today). */
  calendar?: CalendarPassThrough;
  locale?: string;
  id?: string;
  name?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
};

function DatePicker({ value: valueProp, defaultValue, onValueChange, placeholder = "Pick a date", disabled, presets, calendar, locale, id, name, className, ...aria }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inner, setInner] = React.useState(defaultValue);
  const value = valueProp !== undefined ? valueProp : inner;
  const set = (d: Date | undefined) => {
    if (valueProp === undefined) setInner(d);
    onValueChange?.(d);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <DatePickerTrigger id={id} empty={!value} disabled={disabled} className={className} aria-invalid={aria["aria-invalid"]} label={aria["aria-label"]}>
        {value ? formatDate(value, locale) : placeholder}
      </DatePickerTrigger>
      {name && <input type="hidden" name={name} value={value ? value.toISOString().slice(0, 10) : ""} />}
      <PopoverContent data-slot="date-picker-content" align="start" onOpenAutoFocus={(e) => e.preventDefault()} className="w-auto gap-0 p-px">
        <div className="flex flex-col sm:flex-row">
          {presets && (
            <Presets
              presets={presets}
              isActive={(p) => sameDay(p.value, value)}
              onPick={(d) => {
                set(d);
                setOpen(false);
              }}
            />
          )}
          <Calendar
            {...calendar}
            mode="single"
            selected={value}
            defaultMonth={value ?? calendar?.defaultMonth}
            locale={locale}
            autoFocus
            onSelect={(d) => {
              set(d);
              if (d) setOpen(false);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

type DateRangePickerProps = Omit<DatePickerProps, "value" | "defaultValue" | "onValueChange" | "presets"> & {
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (range: DateRange | undefined) => void;
  presets?: Preset<DateRange>[];
  /** How many months show side by side (two by default; one on a phone). */
  numberOfMonths?: number;
};

function DateRangePicker({ value: valueProp, defaultValue, onValueChange, placeholder = "Pick a date range", disabled, presets, calendar, locale, numberOfMonths = 2, id, name, className, ...aria }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inner, setInner] = React.useState(defaultValue);
  const value = valueProp !== undefined ? valueProp : inner;
  const set = (r: DateRange | undefined) => {
    if (valueProp === undefined) setInner(r);
    onValueChange?.(r);
  };
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 39.99rem)");
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const label = formatRange(value, locale);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <DatePickerTrigger id={id} empty={!label} disabled={disabled} className={className} aria-invalid={aria["aria-invalid"]} label={aria["aria-label"]}>
        {label ?? placeholder}
      </DatePickerTrigger>
      {name && (
        <>
          <input type="hidden" name={`${name}From`} value={value?.from ? value.from.toISOString().slice(0, 10) : ""} />
          <input type="hidden" name={`${name}To`} value={value?.to ? value.to.toISOString().slice(0, 10) : ""} />
        </>
      )}
      <PopoverContent data-slot="date-range-picker-content" align="start" onOpenAutoFocus={(e) => e.preventDefault()} className="w-auto max-w-[calc(100vw-2rem)] gap-0 p-px">
        <div className="flex flex-col sm:flex-row">
          {presets && (
            <Presets
              presets={presets}
              isActive={(p) => sameDay(p.value.from, value?.from) && sameDay(p.value.to, value?.to)}
              onPick={(r) => {
                set(r);
                setOpen(false);
              }}
            />
          )}
          <Calendar
            {...calendar}
            mode="range"
            selected={value}
            defaultMonth={value?.from ?? calendar?.defaultMonth}
            numberOfMonths={narrow ? 1 : numberOfMonths}
            locale={locale}
            autoFocus
            onSelect={(r) => {
              set(r);
              if (r?.from && r.to) setOpen(false);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker, DateRangePicker, formatDate, formatRange };
export type { DatePickerProps, DateRangePickerProps };
