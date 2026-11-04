"use client";

import * as React from "react";
import { MinusIcon } from "@phosphor-icons/react/ssr";

import { cn } from "@/lib/utils";

// A one-time code field in Mireye's field language: one 36px square per character, each Input's frame with the compact
// 6px cut (white, 1px Stone line), 8px apart, the characters 16px in DM Mono so codes read as data. The slot the next
// character goes into turns its line Forest and shows a blinking 1px Forest caret; an invalid code turns every line
// brick; disabled slots sit on Mist with Slate characters. One real input lies over the slots, so typing, deleting,
// pasting a whole code, autofill from SMS and arrow keys all work as in any field. `pattern` limits each character.
const REGEXP_ONLY_DIGITS = "^\\d+$";
const REGEXP_ONLY_CHARS = "^[a-zA-Z]+$";
const REGEXP_ONLY_DIGITS_AND_CHARS = "^[a-zA-Z0-9]+$";

type Slot = { char: string | null; isActive: boolean; hasFakeCaret: boolean };
const InputOTPContext = React.createContext<{ slots: Slot[]; invalid: boolean; disabled: boolean }>({ slots: [], invalid: false, disabled: false });

type InputOTPProps = Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "onChange" | "maxLength" | "pattern"> & {
  maxLength: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  /** A regular expression (as a string) each character must match, such as REGEXP_ONLY_DIGITS. */
  pattern?: string;
  containerClassName?: string;
};

function InputOTP({ maxLength, value: valueProp, defaultValue = "", onChange, onComplete, pattern, containerClassName, className, children, disabled = false, onFocus, onBlur, onKeyDown, ...props }: InputOTPProps) {
  const [inner, setInner] = React.useState(defaultValue.slice(0, maxLength));
  const value = valueProp ?? inner;
  const input = React.useRef<HTMLInputElement>(null);
  const [focused, setFocused] = React.useState(false);
  const [selection, setSelection] = React.useState<[number, number]>([value.length, value.length]);
  const test = React.useMemo(() => (pattern ? new RegExp(pattern) : null), [pattern]);

  const sync = React.useCallback(() => {
    const el = input.current;
    if (el && document.activeElement === el) setSelection([el.selectionStart ?? el.value.length, el.selectionEnd ?? el.value.length]);
  }, []);
  React.useEffect(() => {
    document.addEventListener("selectionchange", sync);
    return () => document.removeEventListener("selectionchange", sync);
  }, [sync]);

  const commit = (next: string) => {
    if (valueProp === undefined) setInner(next);
    onChange?.(next);
    if (next.length === maxLength && next !== value) onComplete?.(next);
  };

  // A caret at the end, or the last character selected when the code is full, so typing replaces it.
  const placeCaret = (el: HTMLInputElement) => {
    const at = Math.min(el.value.length, maxLength - 1);
    if (el.value.length >= maxLength) el.setSelectionRange(at, maxLength);
    else el.setSelectionRange(el.value.length, el.value.length);
    sync();
  };

  const [start, end] = selection;
  const active = focused ? (start === end ? Math.min(start, maxLength - 1) : start) : -1;
  const slots: Slot[] = Array.from({ length: maxLength }, (_, i) => ({
    char: value[i] ?? null,
    isActive: i === active,
    hasFakeCaret: focused && start === end && i === start && !value[i],
  }));
  const invalid = props["aria-invalid"] === true || props["aria-invalid"] === "true";

  return (
    <InputOTPContext.Provider value={{ slots, invalid, disabled }}>
      <div data-slot="input-otp" className={cn("relative flex items-center gap-2", containerClassName)}>
        {children}
        <input
          ref={input}
          data-slot="input-otp-input"
          inputMode={pattern === REGEXP_ONLY_DIGITS ? "numeric" : "text"}
          autoComplete="one-time-code"
          spellCheck={false}
          maxLength={maxLength}
          value={value}
          disabled={disabled}
          className={cn("absolute inset-0 size-full cursor-text bg-transparent text-transparent caret-transparent opacity-0 outline-none disabled:cursor-not-allowed", className)}
          onChange={(e) => {
            const next = e.target.value.replace(/\s/g, "").slice(0, maxLength);
            if (next && test && !test.test(next)) return;
            commit(next);
          }}
          onPaste={(e) => {
            // A pasted code replaces the whole field, cut to length and checked against the pattern.
            const text = e.clipboardData.getData("text").replace(/\s/g, "").slice(0, maxLength);
            if (!text) return;
            e.preventDefault();
            if (test && !test.test(text)) return;
            commit(text);
            requestAnimationFrame(() => input.current && placeCaret(input.current));
          }}
          onFocus={(e) => {
            setFocused(true);
            placeCaret(e.currentTarget);
            onFocus?.(e);
          }}
          onMouseUp={(e) => placeCaret(e.currentTarget)}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onKeyDown={(e) => {
            onKeyDown?.(e);
            if (e.defaultPrevented) return;
            const el = e.currentTarget;
            const at = el.selectionStart ?? 0;
            // Arrows move one slot and select it, so the next key replaces that character.
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              const to = Math.max(0, Math.min(e.key === "ArrowLeft" ? at - 1 : at + 1, el.value.length));
              el.setSelectionRange(to, to < el.value.length ? to + 1 : to);
              sync();
            } else if (e.key === "Home" || e.key === "End") {
              e.preventDefault();
              const to = e.key === "Home" ? 0 : el.value.length;
              el.setSelectionRange(to, to);
              sync();
            }
          }}
          {...props}
        />
      </div>
    </InputOTPContext.Provider>
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="input-otp-group" className={cn("flex items-center gap-2", className)} {...props} />;
}

function InputOTPSlot({ index, className, ...props }: React.ComponentProps<"div"> & { index: number }) {
  const { slots, invalid, disabled } = React.useContext(InputOTPContext);
  const { char, hasFakeCaret, isActive } = slots[index] ?? { char: null, hasFakeCaret: false, isActive: false };
  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive || undefined}
      aria-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        "ds-cut-frame relative flex size-9 items-center justify-center font-mono text-h3 leading-none font-normal text-fg [--ds-cut:var(--ds-cut-md)]",
        "[--ds-shape-stroke:var(--ds-color-border-default)] [--ds-shape-fill:var(--ds-color-bg-default)] data-active:[--ds-shape-stroke:var(--ds-color-border-strong)]",
        "aria-invalid:[--ds-shape-stroke:var(--ds-color-status-danger)] data-disabled:text-fg-subtle data-disabled:[--ds-shape-fill:var(--ds-color-bg-subtle-hover)]",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-fg motion-reduce:animate-none" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator(props: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" className="flex items-center text-line" {...props}>
      <MinusIcon className="size-4" />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, REGEXP_ONLY_CHARS, REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS };
