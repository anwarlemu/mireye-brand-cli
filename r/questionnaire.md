# Questionnaire
Questions asked one at a time: Bone cut-frame choice cards with the diamond radio or the square checkbox and a shortcut key, a typed answer, a count over the tick bar, and Previous, Skip and Next.

Install: npx mireye-ds add questionnaire
Requires: theme, icons, button, diamond, input, kbd, progress, utils
Packages: none
Exports: Questionnaire, QuestionnaireActions, QuestionnaireChoice, QuestionnaireChoiceDescription, QuestionnaireChoices, QuestionnaireDescription, QuestionnaireError, QuestionnaireInput, QuestionnaireItem, QuestionnaireNext, QuestionnairePrevious, QuestionnaireProgress, QuestionnaireSkip, QuestionnaireSubmit, QuestionnaireTitle
Client boundary: yes
Reference: Figma UI · Controls (442:145): the diamond radio and the checkbox; UI · Inputs (442:107): the field's cut frame; UI · Progress (442:213): the tick bar


## Usage
Use when the agent or a setup flow needs a few answers in a row (a buy box: how much land, what must be near, when). Pass the questions as items to Questionnaire, then render a QuestionnaireItem per question with a QuestionnaireTitle, a QuestionnaireDescription, QuestionnaireChoices of QuestionnaireChoice (add QuestionnaireInput for another answer) and a QuestionnaireError; end with QuestionnaireActions holding Previous, Skip, Next and Submit. Mark required questions; set multiple to allow several answers. onSubmit receives the native form event: read the answers with FormData.
- Avoid: More than one question on screen
- Avoid: Animating between questions
- Avoid: A required question without its error message
- Avoid: A filled card for a chosen answer
- Avoid: Round radios


## Examples
Example components: npx mireye-ds add questionnaire
[Preview](https://mireye-ds.agencidev.com/preview/questionnaire/Preview) | [Disabled](https://mireye-ds.agencidev.com/preview/questionnaire/Disabled)

examples/questionnaire.tsx

```tsx
"use client";

import * as React from "react";

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire";

const ITEMS = [
  { name: "size", required: true, choices: [{ value: "50" }, { value: "200" }, { value: "500" }] },
  { name: "needs", multiple: true, choices: [{ value: "power" }, { value: "water" }, { value: "rail" }, { value: "fiber" }] },
  { name: "when", required: true, choices: [{ value: "now" }, { value: "year" }, { value: "later" }] },
] as const;

function Saved({ answers }: { answers: string }) {
  return (
    <p role="status" className="ds-cut px-4 py-3 text-body text-fg [--ds-shape-fill:var(--ds-color-bg-subtle)]">
      Saved. {answers}
    </p>
  );
}

export function Preview() {
  const [saved, setSaved] = React.useState<string>();
  return (
    <div className="mx-auto grid w-full max-w-110 gap-4">
      <Questionnaire
        items={ITEMS}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSaved(`Size: ${data.get("size")}+ ac. Needs: ${data.getAll("needs").join(", ") || "none"}. When: ${data.get("when")}.`);
        }}
      >
        <QuestionnaireProgress />
        <QuestionnaireItem name="size" required>
          <QuestionnaireTitle>How much land do you need?</QuestionnaireTitle>
          <QuestionnaireDescription>Choose a minimum, or type your own.</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="50">
              <span>50+ ac</span>
              <QuestionnaireChoiceDescription>A warehouse or a small solar site</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
            <QuestionnaireChoice value="200">
              <span>200+ ac</span>
              <QuestionnaireChoiceDescription>A data center campus</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
            <QuestionnaireChoice value="500">
              <span>500+ ac</span>
              <QuestionnaireChoiceDescription>Utility-scale solar or storage</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
            <QuestionnaireInput aria-label="Another minimum, in acres" placeholder="Another minimum, in acres" />
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireItem name="needs" multiple>
          <QuestionnaireTitle>What must be on or near the site?</QuestionnaireTitle>
          <QuestionnaireDescription>Choose any, or skip this question.</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="power">138 kV or above within 2 mi</QuestionnaireChoice>
            <QuestionnaireChoice value="water">Municipal water</QuestionnaireChoice>
            <QuestionnaireChoice value="rail">A rail spur</QuestionnaireChoice>
            <QuestionnaireChoice value="fiber">Fiber at the road</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireItem name="when" required>
          <QuestionnaireTitle>When do you need it?</QuestionnaireTitle>
          <QuestionnaireDescription>Timing changes which sites the agent puts first.</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="now">Now</QuestionnaireChoice>
            <QuestionnaireChoice value="year">Within a year</QuestionnaireChoice>
            <QuestionnaireChoice value="later">Later than a year</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireSkip />
          <QuestionnaireNext />
          <QuestionnaireSubmit>Save buy box</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
      {saved && <Saved answers={saved} />}
    </div>
  );
}

const PLAN = [{ name: "state", required: true, choices: [{ value: "tx" }, { value: "ok" }, { value: "nm" }] }] as const;

export function Disabled() {
  return (
    <Questionnaire items={PLAN} shortcuts="letters" className="mx-auto max-w-110" onSubmit={(event) => event.preventDefault()}>
      <QuestionnaireItem name="state" required>
        <QuestionnaireTitle>Which state should the search cover?</QuestionnaireTitle>
        <QuestionnaireDescription>Parcel data for New Mexico is not loaded yet.</QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="tx">
            <span>Texas</span>
            <QuestionnaireChoiceDescription>254 counties</QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="ok">
            <span>Oklahoma</span>
            <QuestionnaireChoiceDescription>77 counties</QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="nm" disabled>
            <span>New Mexico</span>
            <QuestionnaireChoiceDescription>Not loaded yet</QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnaireSubmit>Start search</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}

```

## Source

components/ui/questionnaire.tsx

```tsx
"use client";

import * as React from "react";

import { CheckIcon } from "@/components/icons/check";
import { Button } from "@/components/ui/button";
import { Diamond } from "@/components/ui/diamond";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// A short set of questions asked one at a time (a buy box: acreage, power, timing). A choice is a 44px white card in the
// cut frame (1px Stone line, the 8px chamfer at the top-left) with Mireye's radio (an outlined diamond that takes a
// solid node when chosen) or checkbox (a square that fills Forest with the white check) 12px in, a 13px Forest label
// and its number or letter key at the right. Under the pointer the card fills with Fog (150ms); a chosen card takes
// the Forest line. The question is 16px regular with a 13px secondary line under it; progress is a 12px muted count
// over the tick bar. Changing questions is instant: it is driven by the keyboard as often as by the pointer. The
// answers submit as one native form (FormData), every question's inputs included, so the page owns saving and what
// happens next.

type Choice = { readonly value: string; readonly disabled?: boolean };
type ItemConfig = { readonly name: string; readonly required?: boolean; readonly multiple?: boolean; readonly choices?: readonly Choice[] };
type Shortcuts = "numbers" | "letters" | "none";

type QuestionnaireContextValue = {
  order: string[];
  active: string | undefined;
  goTo: (name: string) => void;
  shortcuts: Shortcuts;
  answers: Record<string, string[]>;
  other: Record<string, string>;
  errors: Record<string, string | undefined>;
  configs: React.RefObject<Map<string, ItemConfig>>;
  register: (config: ItemConfig) => () => void;
  setAnswer: (name: string, value: string, checked: boolean) => void;
  setOther: (name: string, text: string) => void;
  next: () => void;
  previous: () => void;
  skip: () => void;
};

const QuestionnaireContext = React.createContext<QuestionnaireContextValue | null>(null);
const ItemContext = React.createContext<{ name: string; required: boolean; multiple: boolean; id: string } | null>(null);

function useQuestionnaire() {
  const context = React.useContext(QuestionnaireContext);
  if (!context) throw new Error("Questionnaire parts must be inside a Questionnaire.");
  return context;
}

function useItem() {
  const context = React.useContext(ItemContext);
  if (!context) throw new Error("This part must be inside a QuestionnaireItem.");
  return context;
}

const shortcutKey = (index: number, shortcuts: Shortcuts) => (shortcuts === "none" || index > 8 ? undefined : shortcuts === "letters" ? String.fromCharCode(65 + index) : String(index + 1));

/**
 * The questions and their answers. Pass `items` (name, required, multiple, choices) so the order, progress and shortcuts
 * are known on the server; without it the order is the QuestionnaireItems' order. `defaultItem` or a controlled
 * `item` with `onItemChange` picks the question shown. `shortcuts` puts 1 to 9 (or A to I) on the choices.
 */
function Questionnaire({
  items,
  defaultItem,
  item,
  onItemChange,
  shortcuts = "numbers",
  className,
  onSubmit,
  onKeyDown,
  children,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  items?: readonly ItemConfig[];
  defaultItem?: string;
  item?: string;
  onItemChange?: (name: string) => void;
  shortcuts?: Shortcuts;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const form = React.useRef<HTMLFormElement>(null);
  const configs = React.useRef(new Map<string, ItemConfig>(items?.map((i) => [i.name, i])));
  const [registered, setRegistered] = React.useState<string[]>([]);
  const order = items ? items.map((i) => i.name) : registered;
  const [internal, setInternal] = React.useState(defaultItem ?? items?.[0]?.name);
  const active = item ?? internal ?? order[0];
  const [answers, setAnswers] = React.useState<Record<string, string[]>>({});
  const [other, setOtherState] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<Record<string, string | undefined>>({});

  const focusItem = React.useCallback((name: string) => {
    requestAnimationFrame(() => {
      const fieldset = form.current?.querySelector<HTMLElement>(`[data-slot=questionnaire-item][data-name="${CSS.escape(name)}"]`);
      fieldset?.querySelector<HTMLElement>("input:not(:disabled)")?.focus({ preventScroll: true });
    });
  }, []);

  const goTo = React.useCallback(
    (name: string) => {
      if (item === undefined) setInternal(name);
      onItemChange?.(name);
      focusItem(name);
    },
    [item, onItemChange, focusItem],
  );

  const register = React.useCallback((config: ItemConfig) => {
    configs.current.set(config.name, { ...configs.current.get(config.name), ...config });
    setRegistered((list) => (list.includes(config.name) ? list : [...list, config.name]));
    return () => setRegistered((list) => list.filter((n) => n !== config.name));
  }, []);

  const answered = React.useCallback((name: string) => (answers[name]?.length ?? 0) > 0 || (other[name] ?? "").trim() !== "", [answers, other]);

  const validate = React.useCallback(
    (name: string) => {
      const config = configs.current.get(name);
      const message = config?.required && !answered(name) ? (config.multiple ? "Choose at least one answer to continue." : "Choose an answer to continue.") : undefined;
      setErrors((e) => ({ ...e, [name]: message }));
      return !message;
    },
    [answered],
  );

  const setAnswer = React.useCallback((name: string, value: string, checked: boolean) => {
    const multiple = configs.current.get(name)?.multiple;
    setAnswers((a) => ({ ...a, [name]: multiple ? (checked ? [...(a[name] ?? []).filter((v) => v !== value), value] : (a[name] ?? []).filter((v) => v !== value)) : checked ? [value] : [] }));
    if (!multiple && checked) setOtherState((o) => ({ ...o, [name]: "" }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  }, []);

  const setOther = React.useCallback((name: string, text: string) => {
    setOtherState((o) => ({ ...o, [name]: text }));
    if (text && !configs.current.get(name)?.multiple) setAnswers((a) => ({ ...a, [name]: [] }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  }, []);

  const index = active ? order.indexOf(active) : -1;
  const next = React.useCallback(() => {
    if (!active || !validate(active)) return focusItem(active ?? "");
    const following = order[index + 1];
    if (following) goTo(following);
  }, [active, validate, focusItem, order, index, goTo]);
  const previous = React.useCallback(() => {
    const before = order[index - 1];
    if (before) goTo(before);
  }, [order, index, goTo]);
  const skip = React.useCallback(() => {
    if (!active) return;
    setAnswers((a) => ({ ...a, [active]: [] }));
    setOtherState((o) => ({ ...o, [active]: "" }));
    setErrors((e) => ({ ...e, [active]: undefined }));
    const following = order[index + 1];
    if (following) goTo(following);
  }, [active, order, index, goTo]);

  const value = React.useMemo<QuestionnaireContextValue>(
    () => ({ order, active, goTo, shortcuts, answers, other, errors, configs, register, setAnswer, setOther, next, previous, skip }),
    [order, active, goTo, shortcuts, answers, other, errors, register, setAnswer, setOther, next, previous, skip],
  );

  return (
    <QuestionnaireContext.Provider value={value}>
      <form
        ref={form}
        data-slot="questionnaire"
        noValidate
        className={cn("flex w-full min-w-0 flex-col gap-4", className)}
        onSubmit={(event) => {
          // Every required question must be answered; the first one that is not is shown with its message.
          const missing = order.find((name) => !validate(name));
          if (missing) {
            event.preventDefault();
            goTo(missing);
            return;
          }
          onSubmit?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || !active || event.metaKey || event.ctrlKey || event.altKey) return;
          const target = event.target as HTMLElement;
          const typing = target instanceof HTMLInputElement && target.type === "text";
          if (event.key === "Enter" && !(target instanceof HTMLButtonElement) && !(target instanceof HTMLTextAreaElement)) {
            event.preventDefault();
            if (index < order.length - 1) next();
            else form.current?.requestSubmit();
            return;
          }
          if (typing || shortcuts === "none") return;
          const key = event.key.toUpperCase();
          const at = shortcuts === "letters" ? key.charCodeAt(0) - 65 : Number(key) - 1;
          if (key.length !== 1 || Number.isNaN(at) || at < 0 || at > 8) return;
          const choice = form.current?.querySelectorAll<HTMLInputElement>(`[data-slot=questionnaire-item][data-name="${CSS.escape(active)}"] [data-slot=questionnaire-choice-input]`)[at];
          if (!choice || choice.disabled) return;
          event.preventDefault();
          choice.focus();
          setAnswer(active, choice.value, choice.type === "checkbox" ? !choice.checked : true);
        }}
        {...props}
      >
        {children}
      </form>
    </QuestionnaireContext.Provider>
  );
}

/** Where the person is: "Question 2 of 3" in 12px muted over the tick bar. */
function QuestionnaireProgress({ className, children, ...props }: React.ComponentProps<"div">) {
  const { order, active } = useQuestionnaire();
  const at = active ? order.indexOf(active) + 1 : 0;
  const total = order.length;
  return (
    <div data-slot="questionnaire-progress" className={cn("grid w-full gap-1.5", className)} {...props}>
      <span className="font-sans text-caption leading-tight text-fg-muted tabular-nums" aria-live="polite">
        {children ?? (total ? `Question ${at} of ${total}` : " ")}
      </span>
      <Progress value={total ? (at / total) * 100 : 0} aria-label="Progress" />
    </div>
  );
}

/** One question. Only the current one shows; the others stay in the form so their answers submit with it. */
function QuestionnaireItem({ name, required = false, multiple = false, className, children, ...props }: Omit<React.ComponentProps<"fieldset">, "name"> & { name: string; required?: boolean; multiple?: boolean }) {
  const { active, register, errors } = useQuestionnaire();
  const id = React.useId();
  React.useLayoutEffect(() => register({ name, required, multiple }), [register, name, required, multiple]);
  const context = React.useMemo(() => ({ name, required, multiple, id }), [name, required, multiple, id]);
  const isActive = active === name;
  return (
    <ItemContext.Provider value={context}>
      <fieldset
        data-slot="questionnaire-item"
        data-name={name}
        data-active={isActive || undefined}
        hidden={!isActive}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description${errors[name] ? ` ${id}-error` : ""}`}
        aria-invalid={errors[name] ? true : undefined}
        className={cn("m-0 flex min-w-0 flex-col gap-4 border-0 p-0 outline-none", className)}
        {...props}
      >
        {children}
      </fieldset>
    </ItemContext.Provider>
  );
}

function QuestionnaireTitle({ className, ...props }: React.ComponentProps<"div">) {
  const { id } = useItem();
  return <div id={`${id}-title`} data-slot="questionnaire-title" className={cn("font-sans text-h3 leading-heading font-normal text-pretty text-fg", className)} {...props} />;
}

function QuestionnaireDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { id } = useItem();
  return <p id={`${id}-description`} data-slot="questionnaire-description" className={cn("-mt-3 font-sans text-body leading-body text-pretty text-fg-secondary", className)} {...props} />;
}

/** The choices of a question, 8px apart; each direct QuestionnaireChoice gets its shortcut in order. */
function QuestionnaireChoices({ className, children, ...props }: React.ComponentProps<"div">) {
  const { multiple, id } = useItem();
  let index = 0;
  return (
    <div data-slot="questionnaire-choices" role={multiple ? "group" : "radiogroup"} aria-labelledby={`${id}-title`} className={cn("group/questionnaire-choices grid min-w-0 gap-2", className)} {...props}>
      {React.Children.map(children, (child) => (React.isValidElement<{ index?: number }>(child) && child.type === QuestionnaireChoice ? React.cloneElement(child, { index: index++ }) : child))}
    </div>
  );
}

function QuestionnaireChoice({ value, disabled = false, index = 0, className, children, ...props }: Omit<React.ComponentProps<"label">, "children"> & { value: string; disabled?: boolean; index?: number; children?: React.ReactNode }) {
  const { answers, setAnswer, shortcuts } = useQuestionnaire();
  const { name, multiple } = useItem();
  const checked = answers[name]?.includes(value) ?? false;
  const key = shortcutKey(index, shortcuts);
  return (
    <label
      data-slot="questionnaire-choice"
      data-type={multiple ? "checkbox" : "radio"}
      data-checked={checked || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        "group/questionnaire-choice ds-cut-frame relative flex min-h-11 cursor-pointer items-start gap-3 px-3 py-3 text-start font-sans text-body leading-snug text-fg select-none [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] after:transition-[background-color] after:duration-fast after:ease-out before:transition-[background-color] before:duration-fast before:ease-out hover:[--ds-shape-fill:var(--ds-color-bg-subtle)] has-focus-visible:outline-solid has-focus-visible:outline-1 has-focus-visible:outline-offset-2 has-focus-visible:outline-line-strong data-checked:[--ds-shape-stroke:var(--ds-color-border-strong)] data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:text-fg-subtle motion-reduce:after:transition-none motion-reduce:before:transition-none",
        className,
      )}
      {...props}
    >
      <input
        data-slot="questionnaire-choice-input"
        type={multiple ? "checkbox" : "radio"}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={(event) => setAnswer(name, value, event.target.checked)}
        className="peer sr-only"
      />
      <span aria-hidden data-slot="questionnaire-choice-indicator" className="pointer-events-none flex h-[1lh] shrink-0 items-center">
        {multiple ? (
          <span className="flex size-4 items-center justify-center border border-line bg-surface text-fg-inverse group-data-checked/questionnaire-choice:border-line-strong group-data-checked/questionnaire-choice:bg-inverse">
            <CheckIcon className="hidden group-data-checked/questionnaire-choice:block" />
          </span>
        ) : (
          <span className="relative flex size-4 items-center justify-center text-line group-data-checked/questionnaire-choice:text-line-strong">
            <Diamond size={28} variant="outline" className="absolute size-4" />
            <Diamond size={12} className="hidden group-data-checked/questionnaire-choice:block" />
          </span>
        )}
      </span>
      <span data-slot="questionnaire-choice-label" className="flex min-w-0 flex-1 flex-col gap-0.5">
        {children}
      </span>
      {key && (
        <Kbd data-slot="questionnaire-choice-shortcut" aria-hidden className="ml-auto hidden shrink-0 sm:inline-flex">
          {key}
        </Kbd>
      )}
    </label>
  );
}

/** A choice's second line: 13px muted. */
function QuestionnaireChoiceDescription({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="questionnaire-choice-description" className={cn("text-fg-muted", className)} {...props} />;
}

/** A free answer typed instead of a choice (another answer); typing clears a single choice, choosing clears the text. */
function QuestionnaireInput({ className, ...props }: Omit<React.ComponentProps<typeof Input>, "name" | "value" | "onChange">) {
  const { other, setOther } = useQuestionnaire();
  const { name } = useItem();
  return (
    <div data-slot="questionnaire-input-wrapper" className="group/questionnaire-input relative w-full min-w-0">
      <Input data-slot="questionnaire-input" type="text" name={name} value={other[name] ?? ""} onChange={(event) => setOther(name, event.target.value)} className={cn("h-11", className)} {...props} />
    </div>
  );
}

/** Why the question cannot be passed yet: 12px in the danger colour, read out when it appears. */
function QuestionnaireError({ className, children, ...props }: React.ComponentProps<"p">) {
  const { errors } = useQuestionnaire();
  const { name, id } = useItem();
  const message = children ?? errors[name];
  if (!message) return null;
  return (
    <p id={`${id}-error`} role="alert" data-slot="questionnaire-error" className={cn("-mt-2 font-sans text-caption leading-tight text-danger", className)} {...props}>
      {message}
    </p>
  );
}

/** The buttons under the question: Previous at the left, then Skip and Next (or Submit on the last question). */
function QuestionnaireActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="questionnaire-actions" className={cn("grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2", className)} {...props} />;
}

type ActionProps = Omit<React.ComponentProps<typeof Button>, "onClick" | "type"> & { onClick?: React.MouseEventHandler<HTMLButtonElement> };

function QuestionnairePrevious({ children, className, variant = "outline", onClick, ...props }: ActionProps) {
  const { order, active, previous } = useQuestionnaire();
  const first = !active || order.indexOf(active) <= 0;
  return (
    <Button
      data-slot="questionnaire-previous"
      variant={variant}
      disabled={first}
      className={cn("col-start-1 row-start-1 justify-self-start", first && "invisible", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) previous();
      }}
      {...props}
    >
      {children ?? "Previous"}
    </Button>
  );
}

function QuestionnaireSkip({ children, className, variant = "ghost", onClick, ...props }: ActionProps) {
  const { active, configs, order, skip } = useQuestionnaire();
  const required = active ? configs.current.get(active)?.required : true;
  const last = !active || order.indexOf(active) === order.length - 1;
  if (required || last) return null;
  return (
    <Button
      data-slot="questionnaire-skip"
      variant={variant}
      className={cn("col-start-2 row-start-1 justify-self-end px-4 text-fg-secondary", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) skip();
      }}
      {...props}
    >
      {children ?? "Skip"}
    </Button>
  );
}

function QuestionnaireNext({ children, className, variant = "default", onClick, ...props }: ActionProps) {
  const { order, active, next } = useQuestionnaire();
  if (!active || order.indexOf(active) >= order.length - 1) return null;
  return (
    <Button
      data-slot="questionnaire-next"
      variant={variant}
      className={cn("col-start-3 row-start-1 justify-self-end", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) next();
      }}
      {...props}
    >
      {children ?? "Next"}
    </Button>
  );
}

function QuestionnaireSubmit({ children, className, variant = "default", ...props }: Omit<React.ComponentProps<typeof Button>, "type">) {
  const { order, active } = useQuestionnaire();
  if (!active || order.indexOf(active) !== order.length - 1) return null;
  return (
    <Button data-slot="questionnaire-submit" type="submit" variant={variant} className={cn("col-start-3 row-start-1 justify-self-end", className)} {...props}>
      {children ?? "Submit"}
    </Button>
  );
}

export {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
};

```
