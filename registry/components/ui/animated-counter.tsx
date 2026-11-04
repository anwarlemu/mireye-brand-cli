"use client";

/**
 * AnimatedCounter: a number that animates to its new value.
 *
 * - animation="count" (default, chosen 29 Oct): the number counts through every value on the way,
 *   in 0.4s on a strong ease-out (a quint), fast at first and settling into the new value.
 *   Tabular figures, so the number does not shift while it counts.
 * - animation="roll": each digit rolls the short way on its own wheel with a soft fade at the top
 *   and bottom, on a spring with no bounce (0.3s). It runs on `motion` (Framer Motion 12.x).
 * - The first render shows the number still; only changes animate.
 * - Under reduced motion the number swaps at once. Screen readers get the plain text.
 */
import { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ComponentProps, ReactNode, Ref } from "react";
import { animate, AnimatePresence, domMax, LazyMotion, useMotionValue, useTransform, type Transition } from "motion/react";
import * as m from "motion/react-m";

import { cn } from "@/lib/utils";

const DIGIT_COUNT = 10;
// Two cycles allow rebasing between rolls instead of wrapping the transform during a roll.
const WHEEL_LENGTH = DIGIT_COUNT * 2 + 1;
const WHEEL_TEXT = Array.from({ length: WHEEL_LENGTH }, (_, index) => index % DIGIT_COUNT).join("\n");
const LINE_HEIGHT = 1.5;
const FADE = `linear-gradient(to bottom,
  rgba(0,0,0,0) 0%,
  rgba(0,0,0,0.06) 5.5%,
  rgba(0,0,0,0.5) 11%,
  rgba(0,0,0,0.94) 16.5%,
  #000 22%,
  #000 78%,
  rgba(0,0,0,0.94) 83.5%,
  rgba(0,0,0,0.5) 89%,
  rgba(0,0,0,0.06) 94.5%,
  rgba(0,0,0,0) 100%)`;

const FADE_PROPS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } },
} as const;

const MAX_DECIMALS = 15;
const MAX_PAD = 24;
const DEFAULT_NUMBER_FORMATTER = new Intl.NumberFormat("en-US", { useGrouping: false });
const DECIMAL_FORMATTERS = new Map<number, Intl.NumberFormat>();
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const modulo = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor;
const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia?.(REDUCED_MOTION_QUERY);
  query?.addEventListener("change", onChange);
  return () => query?.removeEventListener("change", onChange);
}

const getReducedMotion = () => window.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false;
const getServerReducedMotion = () => false;

export type Grouping = "western" | "indian";

type Cell = { kind: "digit"; key: number; digit: number } | { kind: "mark"; key: string; char: string };
type CounterFormat = { amount: number; text: string; cells: Cell[]; negative: boolean; layout: string };

function numberFormatter(decimals: number | undefined) {
  if (decimals === undefined) return DEFAULT_NUMBER_FORMATTER;
  const places = clamp(Math.trunc(decimals), 0, MAX_DECIMALS);
  let formatter = DECIMAL_FORMATTERS.get(places);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", { useGrouping: false, minimumFractionDigits: places, maximumFractionDigits: places });
    DECIMAL_FORMATTERS.set(places, formatter);
  }
  return formatter;
}

function formatCounter(value: number, decimals: number | undefined, padStart: number, separator: string, decimalSeparator: string, grouping: Grouping): CounterFormat {
  const amount = Number.isFinite(value) ? value : 0;
  const absolute = Math.abs(amount);
  const raw = decimals === undefined && Number.isSafeInteger(absolute) ? String(absolute) : numberFormatter(decimals).format(absolute);
  const [integer, fraction = ""] = raw.split(".");
  const whole = integer.padStart(clamp(Math.trunc(padStart), 1, MAX_PAD), "0");
  const negative = amount < 0 && /[1-9]/.test(raw);
  const cells: Cell[] = [];

  for (let index = 0; index < whole.length; index++) {
    const place = whole.length - index - 1;
    cells.push({ kind: "digit", key: place, digit: Number(whole[index]) });
    const groupBoundary = grouping === "indian" ? place === 3 || (place > 3 && (place - 3) % 2 === 0) : place % 3 === 0;
    if (separator && place > 0 && groupBoundary) cells.push({ kind: "mark", key: `group-${place}`, char: separator });
  }

  if (fraction) {
    cells.push({ kind: "mark", key: "decimal", char: decimalSeparator });
    for (let index = 0; index < fraction.length; index++) {
      cells.push({ kind: "digit", key: -index - 1, digit: Number(fraction[index]) });
    }
  }

  const sign = negative ? "-" : "";
  return {
    amount,
    cells,
    negative,
    text: sign + cells.map((cell) => (cell.kind === "digit" ? cell.digit : cell.char)).join(""),
    layout: sign + cells.map((cell) => (cell.kind === "digit" ? "0" : cell.char)).join(""),
  };
}

function useWheel(from: number, digit: number, direction: number, transition: Transition) {
  const position = useMotionValue(from);
  const target = useRef(from);
  const heading = useRef(direction);

  useEffect(() => {
    heading.current = direction;
  }, [direction]);

  useEffect(() => {
    const current = position.get();
    let start = current;
    if (modulo(target.current, DIGIT_COUNT) !== digit) {
      start = modulo(current, DIGIT_COUNT) + (heading.current < 0 ? DIGIT_COUNT : 0);
      target.current = Math.round(heading.current < 0 ? start - modulo(start - digit, DIGIT_COUNT) : start + modulo(digit - start, DIGIT_COUNT));
    }
    if (current === start && start === target.current) return;
    position.jump(start);
    if (start === target.current) return;
    const animation = animate(position, target.current, transition);
    return () => animation.stop();
  }, [digit, transition, position]);

  return useTransform(position, (value) => `${(-value * 100) / WHEEL_LENGTH}%`);
}

type SlotProps = {
  layoutDependency: string;
  transition: Transition;
};

function Fixed({ children, ...slot }: SlotProps & { children: ReactNode }) {
  return (
    <m.span layout="position" {...slot} className="inline-block">
      {children}
    </m.span>
  );
}

function Mark({ char, ref, ...slot }: SlotProps & { char: string; ref?: Ref<HTMLSpanElement> }) {
  return (
    <m.span ref={ref} data-slot="animated-counter-mark" layout="position" {...slot} {...FADE_PROPS} className="inline-block">
      {char}
    </m.span>
  );
}

const Digit = memo(function Digit({ digit, from, direction, ref, ...slot }: SlotProps & { digit: number; from: number; direction: number; ref?: Ref<HTMLSpanElement> }) {
  const y = useWheel(from, digit, direction, slot.transition);

  return (
    <m.span ref={ref} data-slot="animated-counter-digit" layout="position" {...slot} {...FADE_PROPS} className="relative inline-grid overflow-hidden" style={{ height: `${LINE_HEIGHT}em`, lineHeight: LINE_HEIGHT, maskImage: FADE, WebkitMaskImage: FADE }}>
      <span className="invisible">0</span>
      <m.span style={{ y }} className="absolute inset-x-0 top-0 whitespace-pre text-center">
        {WHEEL_TEXT}
      </m.span>
    </m.span>
  );
});

function CounterContents({ formatted, duration, prefix, suffix }: { formatted: CounterFormat; duration: number; prefix?: ReactNode; suffix?: ReactNode }) {
  const [history, setHistory] = useState({ previous: formatted, current: formatted, animated: false });
  if (history.current.amount !== formatted.amount || history.current.text !== formatted.text) {
    setHistory({ previous: history.current, current: formatted, animated: history.animated || history.current.text !== formatted.text });
  }

  const transition = useMemo<Transition>(() => ({ type: "spring", visualDuration: duration, bounce: 0 }), [duration]);
  const previousDigits = useMemo(() => new Map(history.previous.cells.flatMap((cell) => (cell.kind === "digit" ? [[cell.key, cell.digit] as const] : []))), [history.previous]);
  const direction = Math.abs(formatted.amount) >= Math.abs(history.previous.amount) ? 1 : -1;
  const slot: SlotProps = { layoutDependency: formatted.layout, transition };

  if (!history.animated)
    return (
      <>
        {prefix}
        {formatted.text}
        {suffix}
      </>
    );

  return (
    <LazyMotion features={domMax}>
      {prefix != null && <Fixed {...slot}>{prefix}</Fixed>}
      <span className="sr-only">{formatted.text}</span>
      <span aria-hidden className="relative inline-flex select-none items-center">
        {formatted.negative && <Fixed {...slot}>-</Fixed>}
        <AnimatePresence mode="popLayout" initial={false}>
          {formatted.cells.map((cell) => (cell.kind === "digit" ? <Digit key={cell.key} {...slot} digit={cell.digit} from={previousDigits.get(cell.key) ?? 0} direction={direction} /> : <Mark key={cell.key} {...slot} char={cell.char} />))}
        </AnimatePresence>
      </span>
      {suffix != null && <Fixed {...slot}>{suffix}</Fixed>}
    </LazyMotion>
  );
}

export type AnimatedCounterProps = Omit<ComponentProps<"span">, "children" | "prefix"> & {
  value: number;
  /** "count" (default): counts through the values. "roll": each digit rolls on a wheel. */
  animation?: "count" | "roll";
  decimals?: number;
  duration?: number;
  padStart?: number;
  separator?: string;
  decimalSeparator?: string;
  grouping?: Grouping;
  prefix?: ReactNode;
  suffix?: ReactNode;
};

export const AnimatedCounter = memo(function AnimatedCounter({ value, animation = "count", decimals, duration, padStart = 1, separator = ",", decimalSeparator = ".", grouping = "western", prefix, suffix, className, ...props }: AnimatedCounterProps) {
  const reduced = useSyncExternalStore(subscribeToReducedMotion, getReducedMotion, getServerReducedMotion);
  const formatted = useMemo(() => formatCounter(value, decimals, padStart, separator, decimalSeparator, grouping), [value, decimals, padStart, separator, decimalSeparator, grouping]);
  const format = (v: number) => formatCounter(v, decimals, padStart, separator, decimalSeparator, grouping).text;

  if (animation === "count") {
    return (
      <span data-slot="animated-counter" className={cn("inline-flex items-center tabular-nums", className)} {...props}>
        <span className="sr-only">
          {formatted.negative ? "-" : ""}
          {formatted.text}
        </span>
        <span aria-hidden className="whitespace-nowrap">
          {prefix}
          <CountUp value={value} decimals={decimals} duration={duration ?? 0.4} reduced={reduced} format={format} />
          {suffix}
        </span>
      </span>
    );
  }

  return (
    <span data-slot="animated-counter" className={cn("inline-flex h-[1em] items-center tabular-nums", className)} {...props}>
      {reduced ? (
        <>
          {prefix}
          {formatted.text}
          {suffix}
        </>
      ) : (
        <CounterContents formatted={formatted} duration={clamp(duration ?? 0.3, 0.01, 60)} prefix={prefix} suffix={suffix} />
      )}
    </span>
  );
});

/** Counts from the last value shown to `value` on a quint ease-out; the first render is still. */
function CountUp({ value, decimals, duration, reduced, format }: { value: number; decimals?: number; duration: number; reduced: boolean; format: (v: number) => string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const a = from.current;
    if (reduced || a === value) {
      from.current = value;
      setShown(value);
      return;
    }
    const step = 10 ** -(decimals ?? 0);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const v = t >= 1 ? value : Math.round((a + (value - a) * (1 - (1 - t) ** 5)) / step) * step;
      from.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, decimals, duration, reduced]);
  const text = format(Math.abs(shown));
  return <>{shown < 0 ? `-${text}` : text}</>;
}

export default AnimatedCounter;
