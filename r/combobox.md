# Combobox
A searchable choice: the select's trigger, and a list in the field's frame with a 36px search row (the parcel glyph) and 28px rows whose typed part is full Forest. The highlighted row is a Fog plate with the small cut; chosen rows are full Forest with a solid diamond. Rows can carry a short detail (a state). ComboboxChips holds several values as square Fog chips.

Install: npx mireye-ds add combobox
Requires: theme, icons, diamond, dial, surface, utils
Packages: radix-ui, cmdk, @phosphor-icons/react
Exports: Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxClear, ComboboxCollection, ComboboxContent, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList, ComboboxSeparator, ComboboxTrigger, ComboboxValue, useCombobox, useComboboxAnchor
Client boundary: yes
Reference: The design's search field with floating results (not in Figma yet), drawn with the field (442:107)


## Usage
Use to pick a place or record by name from a long list (a county, a parcel, a saved site), or several values (map layers) with ComboboxChips. Pass `detail` for the state or acreage, and `searching` on ComboboxInput while the parent's search runs (the Dial turns). The list fades at an edge (fade-y) where more options scroll past it.
- Avoid: A spinner other than the Dial
- Avoid: Rounded chips or rows
- Avoid: Animating rows as the highlight moves (it follows the keys)


## Examples
Example components: npx mireye-ds add combobox label
Example packages: @phosphor-icons/react
[Preview](https://mireye-ds.agencidev.com/preview/combobox/Preview) | [Multiple](https://mireye-ds.agencidev.com/preview/combobox/Multiple) | [Creatable](https://mireye-ds.agencidev.com/preview/combobox/Creatable) | [Groups](https://mireye-ds.agencidev.com/preview/combobox/Groups) | [States](https://mireye-ds.agencidev.com/preview/combobox/States)

examples/combobox.tsx

```tsx
"use client";

import * as React from "react";
import { PlusIcon } from "@phosphor-icons/react/ssr";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useCombobox,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";

const COUNTIES = [
  { value: "marion-or", label: "Marion County", detail: "OR" },
  { value: "linn-or", label: "Linn County", detail: "OR" },
  { value: "lane-or", label: "Lane County", detail: "OR" },
  { value: "maricopa-az", label: "Maricopa County", detail: "AZ" },
  { value: "travis-tx", label: "Travis County", detail: "TX" },
  { value: "loudoun-va", label: "Loudoun County", detail: "VA", disabled: true },
];

const LAYERS = ["Parcels", "Substations", "Transmission lines", "Floodplain", "Wetlands", "Zoning", "Roads", "Rail", "Fiber"];

export function Preview() {
  const [county, setCounty] = React.useState<string | null>("marion-or");
  return (
    <div className="grid w-full max-w-80 gap-2">
      <Label id="county-label">County</Label>
      <Combobox items={COUNTIES} value={county} onValueChange={setCounty}>
        <ComboboxTrigger aria-labelledby="county-label">
          <ComboboxValue placeholder="Choose a county" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search counties" />
          <ComboboxList>
            <ComboboxEmpty>No county by that name.</ComboboxEmpty>
            {COUNTIES.map((c) => (
              <ComboboxItem key={c.value} value={c.value} label={c.label} detail={c.detail} disabled={c.disabled} />
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function Multiple() {
  const [layers, setLayers] = React.useState<string[]>(["Parcels", "Substations"]);
  return (
    <div className="grid w-full max-w-100 gap-2">
      <Label htmlFor="layers">Map layers</Label>
      <Combobox multiple items={LAYERS} value={layers} onValueChange={setLayers} name="layers">
        <ComboboxChips>
          {layers.map((l) => (
            <ComboboxChip key={l} value={l} />
          ))}
          <ComboboxChipsInput id="layers" placeholder={layers.length ? "" : "Add layers"} />
          <ComboboxClear />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxList>{(item) => <ComboboxItem value={item.value}>{item.label}</ComboboxItem>}</ComboboxList>
          <ComboboxEmpty>No such layer.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

// The "Create" row reads the search from the combobox and offers it as a new value; choosing it calls onValueChange.
function CreateRow({ known }: { known: string[] }) {
  const { search } = useCombobox();
  const value = search.trim().toLowerCase();
  if (!value || known.includes(value)) return null;
  return (
    <>
      <ComboboxSeparator />
      <ComboboxItem value={value} label={value}>
        <PlusIcon />
        Create &ldquo;{value}&rdquo;
      </ComboboxItem>
    </>
  );
}

export function Creatable() {
  const [tags, setTags] = React.useState(["shortlist", "needs survey", "rejected"]);
  const [tag, setTag] = React.useState<string | null>(null);
  return (
    <div className="grid w-full max-w-80 gap-1">
      <Label id="tag-label">Site tag</Label>
      <Combobox items={tags} value={tag} onValueChange={(v) => {
        if (v && !tags.includes(v)) setTags((t) => [...t, v]);
        setTag(v);
      }}>
        <ComboboxTrigger aria-labelledby="tag-label">
          <ComboboxValue placeholder="Add a tag" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search or create a tag" />
          <ComboboxList>
            {tags.map((t) => (
              <ComboboxItem key={t} value={t}>
                {t}
              </ComboboxItem>
            ))}
            <CreateRow known={tags} />
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function Groups() {
  const [site, setSite] = React.useState<string | null>(null);
  return (
    <div className="grid w-full max-w-80 gap-2">
      <Label id="site-label">Compare with</Label>
      <Combobox
        value={site}
        onValueChange={setSite}
        items={[
          { value: "041-220-17", label: "041-220-17" },
          { value: "041-310-02", label: "041-310-02" },
          { value: "north-campus", label: "North campus" },
        ]}
      >
        <ComboboxTrigger aria-labelledby="site-label">
          <ComboboxValue placeholder="Choose a site" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search sites" searching />
          <ComboboxList>
            <ComboboxEmpty />
            <ComboboxGroup heading="Parcels">
              <ComboboxItem value="041-220-17" detail="41.2 ac">041-220-17</ComboboxItem>
              <ComboboxItem value="041-310-02" detail="88.0 ac">041-310-02</ComboboxItem>
            </ComboboxGroup>
            <ComboboxSeparator />
            <ComboboxGroup heading="Saved sites">
              <ComboboxItem value="north-campus" detail="3 parcels">North campus</ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function States() {
  return (
    <div className="grid w-full max-w-80 gap-4">
      <Combobox items={COUNTIES} defaultValue="marion-or" disabled>
        <ComboboxTrigger aria-label="Locked county" />
      </Combobox>
      <div className="grid gap-2">
        <Combobox items={COUNTIES}>
          <ComboboxTrigger aria-label="Required county" aria-invalid>
            <ComboboxValue placeholder="Choose a county" />
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxInput placeholder="Search counties" />
            <ComboboxList>{(c) => <ComboboxItem value={c.value}>{c.label}</ComboboxItem>}</ComboboxList>
          </ComboboxContent>
        </Combobox>
        <p className="m-0 text-caption leading-line-caption text-danger">Choose the county to search.</p>
      </div>
    </div>
  );
}

```

## Source

components/ui/combobox.tsx

```tsx
"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { Command as CommandPrimitive } from "cmdk";
import { XIcon } from "@phosphor-icons/react/ssr";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { ParcelIcon } from "@/components/icons/parcel-icon";
import { Diamond } from "@/components/ui/diamond";
import { Dial } from "@/components/ui/dial";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A searchable choice, for finding a place or any record by name (the design's search field and its floating results).
// The trigger is the select's: Input's frame (white, 1px Stone line, the 8px cut, 36px) with the value in 13px Forest
// (the placeholder Slate) and the brand arrow's head turned down, turning up while open; open, its line is Forest.
// The list floats 4px under it in the same frame (no shadow), fading in from 0.98 (the shared pop): a 36px search row with
// the parcel glyph over a Mist rule, then 28px rows with 12px sides in 80% Forest. The typed part of each name is
// full Forest. The highlighted row is a Fog plate with the small cut, at once (it follows the keys); a chosen row is
// full Forest with a solid diamond before it. `detail` puts a short 12px note on a row's right (State, County).
// `searching` on ComboboxInput turns the Dial at the end of the search row while the parent's search runs. For
// several values, ComboboxChips is the frame holding square Fog chips with an x, and an input that filters as you
// type (Backspace on an empty input removes the last chip).

type Item = { value: string; label: string; disabled?: boolean };

type ComboboxContextValue = {
  multiple: boolean;
  values: string[];
  toggle: (value: string) => void;
  remove: (value: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  search: string;
  setSearch: (search: string) => void;
  labelOf: (value: string) => string;
  register: (value: string, label: string) => void;
  items?: Item[];
  disabled?: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
  chipsRef: React.RefObject<HTMLDivElement | null>;
  chips: boolean;
  setChips: (chips: boolean) => void;
  contentId: string;
};

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null);

function useCombobox() {
  const context = React.useContext(ComboboxContext);
  if (!context) throw new Error("Combobox parts must be used within <Combobox>");
  return context;
}

type ComboboxBaseProps = {
  /** The choices, for labels while the list is closed and for ComboboxList's render function. */
  items?: (Item | string)[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  /** The submitted name: one hidden input per chosen value. */
  name?: string;
  children?: React.ReactNode;
};

type ComboboxSingleProps = ComboboxBaseProps & { multiple?: false; value?: string | null; defaultValue?: string | null; onValueChange?: (value: string | null) => void };
type ComboboxMultipleProps = ComboboxBaseProps & { multiple: true; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void };

const normalize = (items?: (Item | string)[]) => items?.map((i) => (typeof i === "string" ? { value: i, label: i } : i));

function Combobox(props: ComboboxSingleProps | ComboboxMultipleProps) {
  const { open: openProp, defaultOpen = false, onOpenChange, disabled, name, children } = props;
  const multiple = props.multiple === true;
  const items = React.useMemo(() => normalize(props.items), [props.items]);
  const initial = props.defaultValue == null ? [] : Array.isArray(props.defaultValue) ? props.defaultValue : [props.defaultValue];
  const [inner, setInner] = React.useState<string[]>(initial);
  const controlled = props.value !== undefined;
  const values = controlled ? (props.value == null ? [] : Array.isArray(props.value) ? props.value : [props.value]) : inner;
  const [openInner, setOpenInner] = React.useState(defaultOpen);
  const open = openProp ?? openInner;
  const [search, setSearch] = React.useState("");
  const [chips, setChips] = React.useState(false);
  const labels = React.useRef(new Map<string, string>());
  const listRef = React.useRef<HTMLDivElement>(null);
  const chipsRef = React.useRef<HTMLDivElement>(null);
  const contentId = React.useId();

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenInner(next);
      onOpenChange?.(next);
      if (!next) setSearch("");
    },
    [openProp, onOpenChange],
  );
  const commit = (next: string[]) => {
    if (!controlled) setInner(next);
    if (multiple) (props as ComboboxMultipleProps).onValueChange?.(next);
    else (props as ComboboxSingleProps).onValueChange?.(next[0] ?? null);
  };
  const toggle = (value: string) => {
    if (multiple) {
      commit(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
      setSearch("");
    } else {
      // Picking the chosen value again keeps it; ComboboxClear empties the field.
      commit([value]);
      setOpen(false);
    }
  };
  const remove = (value: string) => commit(values.filter((v) => v !== value));
  const labelOf = (value: string) => labels.current.get(value) ?? items?.find((i) => i.value === value)?.label ?? value;
  const register = React.useCallback((value: string, label: string) => labels.current.set(value, label), []);

  return (
    <ComboboxContext.Provider value={{ multiple, values, toggle, remove, clear: () => commit([]), open, setOpen, search, setSearch, labelOf, register, items, disabled, listRef, chipsRef, chips, setChips, contentId }}>
      <PopoverPrimitive.Root data-slot="combobox" open={open} onOpenChange={setOpen}>
        {children}
      </PopoverPrimitive.Root>
      {name && values.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
    </ComboboxContext.Provider>
  );
}

const FIELD = cn(
  "ds-cut-frame flex min-h-9 w-full min-w-0 items-center gap-2 px-4 font-sans text-body leading-tight font-normal text-fg outline-none",
  "[--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] aria-invalid:[--ds-shape-stroke:var(--ds-color-status-danger)]",
);

/** The closed field: the chosen value (ComboboxValue) and the caret. Opens the list. */
function ComboboxTrigger({ className, children, ...props }: React.ComponentProps<"button">) {
  const { open, disabled, values, contentId } = useCombobox();
  return (
    <PopoverPrimitive.Trigger asChild>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={contentId}
        data-slot="combobox-trigger"
        data-empty={!values.length}
        disabled={disabled}
        className={cn(FIELD, "group/combobox-trigger h-9 cursor-pointer text-left focus-visible:[--ds-shape-stroke:var(--ds-color-border-strong)] aria-expanded:[--ds-shape-stroke:var(--ds-color-border-strong)] disabled:cursor-not-allowed disabled:text-fg-subtle disabled:[--ds-shape-fill:var(--ds-color-bg-subtle-hover)] data-[empty=true]:text-fg-subtle", className)}
        {...props}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 truncate">{children ?? <ComboboxValue />}</span>
        <ArrowRightIcon size={16} head className="shrink-0 rotate-90 text-fg transition-transform duration-fast ease-out group-aria-expanded/combobox-trigger:-rotate-90 group-disabled/combobox-trigger:text-fg-subtle motion-reduce:transition-none" />
      </button>
    </PopoverPrimitive.Trigger>
  );
}

/** The chosen value's label, the chosen labels joined, or the placeholder. */
function ComboboxValue({ placeholder = "Select", children }: { placeholder?: string; children?: (values: string[]) => React.ReactNode }) {
  const { values, labelOf } = useCombobox();
  if (children) return <>{children(values)}</>;
  return <span data-slot="combobox-value">{values.length ? values.map(labelOf).join(", ") : placeholder}</span>;
}

/** Clears every chosen value. Put it inside ComboboxChips or beside a trigger. */
function ComboboxClear({ className, ...props }: React.ComponentProps<"button">) {
  const { values, clear, disabled } = useCombobox();
  if (!values.length) return null;
  return (
    <button
      type="button"
      data-slot="combobox-clear"
      aria-label="Clear"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        clear();
      }}
      className={cn("inline-flex size-6 shrink-0 cursor-pointer items-center justify-center text-fg-muted outline-none transition-[color] duration-fast ease-out hover:text-fg focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong motion-reduce:transition-none", className)}
      {...props}
    >
      <XIcon className="size-4" />
    </button>
  );
}

function ComboboxContent({ className, children, align = "start", sideOffset = 4, anchor, onInteractOutside, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content> & { anchor?: React.RefObject<HTMLElement | null> }) {
  const container = usePortalContainer();
  const { search, chips, listRef, chipsRef, contentId, open } = useCombobox();
  // With chips cmdk does not filter, so it would keep a hidden row highlighted: highlight the first match instead.
  const [active, setActive] = React.useState("");
  React.useEffect(() => {
    if (!chips || !open) return;
    const frame = requestAnimationFrame(() => setActive(listRef.current?.querySelector("[cmdk-item]:not([data-disabled=true])")?.getAttribute("data-value") ?? ""));
    return () => cancelAnimationFrame(frame);
  }, [chips, open, search, listRef]);
  return (
    <>
    {anchor && <PopoverPrimitive.Anchor virtualRef={anchor as React.RefObject<HTMLElement>} />}
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        id={contentId}
        data-slot="combobox-content"
        align={align}
        sideOffset={sideOffset}
        // With chips the typing stays in the field; the list follows it.
        onOpenAutoFocus={chips ? (e) => e.preventDefault() : undefined}
        onInteractOutside={(e) => {
          onInteractOutside?.(e);
          // A press in the chips field keeps the list open: the field is where the typing happens.
          if (chips && chipsRef.current?.contains(e.target as Node)) e.preventDefault();
        }}
        className={cn(
          "ds-cut-frame z-50 w-(--radix-popover-trigger-width) min-w-56 max-w-[calc(100vw-2rem)] origin-(--radix-popover-content-transform-origin) overflow-hidden text-fg outline-none [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in motion-reduce:animate-none",
          className,
        )}
        {...props}
      >
        <CommandPrimitive ref={listRef} shouldFilter={!chips} {...(chips ? { value: active, onValueChange: setActive } : {})} className="flex flex-col">
          {children}
        </CommandPrimitive>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
    </>
  );
}

/** The search row at the top of the list. `searching` turns the Dial at its end while a search runs. */
function ComboboxInput({ className, placeholder = "Search", searching = false, ...props }: Omit<React.ComponentProps<typeof CommandPrimitive.Input>, "value" | "onValueChange"> & { searching?: boolean }) {
  const { search, setSearch } = useCombobox();
  return (
    <div data-slot="combobox-input-wrapper" className="flex h-9 shrink-0 items-center gap-2 border-b border-line-subtle px-4">
      <ParcelIcon size={10} className="size-2.5 shrink-0 text-fg" />
      <CommandPrimitive.Input
        data-slot="combobox-input"
        value={search}
        onValueChange={setSearch}
        placeholder={placeholder}
        className={cn("h-full w-full min-w-0 bg-transparent font-sans text-body leading-tight text-fg caret-fg outline-none placeholder:text-fg-subtle", className)}
        {...props}
      />
      {searching && <Dial size={24} aria-label="Searching" />}
    </div>
  );
}

/** The rows. Pass items as children, or a function that renders each of the Combobox's items. */
function ComboboxList({ className, children, ...props }: Omit<React.ComponentProps<typeof CommandPrimitive.List>, "children"> & { children?: React.ReactNode | ((item: Item) => React.ReactNode) }) {
  const { items } = useCombobox();
  return (
    <CommandPrimitive.List data-slot="combobox-list" className={cn("max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto overscroll-contain fade-y p-1 [&_[cmdk-list-sizer]]:flex [&_[cmdk-list-sizer]]:flex-col [&_[cmdk-list-sizer]]:gap-px [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-px", className)} {...props}>
      {typeof children === "function" ? items?.map((item) => <React.Fragment key={item.value}>{children(item)}</React.Fragment>) : children}
    </CommandPrimitive.List>
  );
}

/** Renders a group's own items with a function, inside a ComboboxGroup. */
function ComboboxCollection({ items, children }: { items: (Item | string)[]; children: (item: Item) => React.ReactNode }) {
  return <>{normalize(items)?.map((item) => <React.Fragment key={item.value}>{children(item)}</React.Fragment>)}</>;
}

function ComboboxItem({ value, label, detail, className, children, disabled, ...props }: Omit<React.ComponentProps<typeof CommandPrimitive.Item>, "value" | "onSelect"> & { value: string; label?: string; detail?: React.ReactNode }) {
  const { values, toggle, register, chips, search } = useCombobox();
  const text = label ?? (typeof children === "string" ? children : value);
  React.useEffect(() => {
    register(value, text);
  }, [register, value, text]);
  // With chips, cmdk does not filter (the typing is outside it): hide rows that do not match here.
  if (chips && search && !text.toLowerCase().includes(search.toLowerCase())) return null;
  const selected = values.includes(value);
  return (
    <CommandPrimitive.Item
      data-slot="combobox-item"
      value={`${text} ${value}`}
      disabled={disabled}
      data-checked={selected || undefined}
      onSelect={() => toggle(value)}
      className={cn(
        "ds-cut relative flex h-7 shrink-0 cursor-default items-center gap-2 px-3 font-sans text-body leading-tight font-normal text-fg-secondary outline-none select-none [--ds-cut:var(--ds-cut-sm)]",
        "data-checked:text-fg data-[disabled=true]:pointer-events-none data-[disabled=true]:text-fg-subtle data-[selected=true]:[--ds-shape-fill:var(--ds-color-bg-subtle)]",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([data-slot]):not([class*='size-'])]:size-4 [&_svg:not([data-slot]):not([class*='text-'])]:text-icon-secondary",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="flex w-2 shrink-0 items-center justify-center">
        {selected && <Diamond size={8} className="size-1.5" />}
      </span>
      <span className="min-w-0 flex-1 truncate">{typeof children === "string" || children == null ? <Highlight text={text} query={search} /> : children}</span>
      {detail != null && <span className="shrink-0 text-caption text-fg-muted">{detail}</span>}
    </CommandPrimitive.Item>
  );
}

/** The typed part of a name in full Forest; the rest stays in the row's 80% Forest. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="text-fg">{text.slice(at, at + q.length)}</span>
      {text.slice(at + q.length)}
    </>
  );
}

function ComboboxEmpty({ className, children = "No results.", ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  const { chips, search, items, labelOf, values } = useCombobox();
  // cmdk's own empty state only knows its filter; with chips, decide here.
  if (chips) {
    const any = (items ?? values.map((v) => ({ value: v, label: labelOf(v) }))).some((i) => !search || i.label.toLowerCase().includes(search.toLowerCase()));
    if (any) return null;
    return (
      <div data-slot="combobox-empty" className={cn("px-3 py-4 text-body text-fg-muted", className)}>
        {children}
      </div>
    );
  }
  return (
    <CommandPrimitive.Empty data-slot="combobox-empty" className={cn("px-3 py-4 text-body text-fg-muted", className)} {...props}>
      {children}
    </CommandPrimitive.Empty>
  );
}

function ComboboxGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="combobox-group"
      className={cn("overflow-hidden text-fg [&_[cmdk-group-heading]]:mr-3 [&_[cmdk-group-heading]]:ml-7 [&_[cmdk-group-heading]]:mt-2 [&_[cmdk-group-heading]]:mb-1 [&_[cmdk-group-heading]]:text-caption [&_[cmdk-group-heading]]:leading-line-caption [&_[cmdk-group-heading]]:text-fg-muted", className)}
      {...props}
    />
  );
}

/** A heading inside the list that is not a group's (a note above the rows). */
function ComboboxLabel({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="combobox-label" className={cn("mt-2 mr-3 mb-1 ml-7 text-caption leading-line-caption text-fg-muted", className)} {...props} />;
}

function ComboboxSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator data-slot="combobox-separator" className={cn("-mx-1 my-1 h-px shrink-0 bg-line-subtle", className)} {...props} />;
}

/** The field for several values: chips and a text input, anchoring the list. */
function ComboboxChips({ className, children, ...props }: React.ComponentProps<"div">) {
  const { setChips, setOpen, disabled, chipsRef } = useCombobox();
  React.useEffect(() => {
    setChips(true);
    return () => setChips(false);
  }, [setChips]);
  return (
    <PopoverPrimitive.Anchor asChild>
      <div
        ref={chipsRef}
        data-slot="combobox-chips"
        data-disabled={disabled || undefined}
        onMouseDown={(e) => {
          if (disabled || e.target !== e.currentTarget) return;
          e.preventDefault();
          e.currentTarget.querySelector("input")?.focus();
          setOpen(true);
        }}
        className={cn(FIELD, "flex-wrap gap-1 py-1.5 pr-2 pl-2 has-[input:focus]:[--ds-shape-stroke:var(--ds-color-border-strong)] data-disabled:text-fg-subtle data-disabled:[--ds-shape-fill:var(--ds-color-bg-subtle-hover)]", className)}
        {...props}
      >
        {children}
      </div>
    </PopoverPrimitive.Anchor>
  );
}

function ComboboxChip({ value, className, children, ...props }: React.ComponentProps<"span"> & { value: string }) {
  const { remove, labelOf, disabled } = useCombobox();
  return (
    <span data-slot="combobox-chip" className={cn("inline-flex h-6 max-w-full items-center gap-1 bg-tag pr-0.5 pl-2 text-caption leading-tight text-tag-fg", className)} {...props}>
      <span className="truncate">{children ?? labelOf(value)}</span>
      <button
        type="button"
        aria-label={`Remove ${labelOf(value)}`}
        disabled={disabled}
        onClick={() => remove(value)}
        className="inline-flex size-5 cursor-pointer items-center justify-center text-fg-muted outline-none transition-[background-color,color] duration-fast ease-out hover:bg-subtle-hover hover:text-fg active:bg-subtle active:duration-0 focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-line-strong motion-reduce:transition-none"
      >
        <XIcon className="size-3" />
      </button>
    </span>
  );
}

/** The typing part of ComboboxChips: filters the list; arrows and Enter work the list; Backspace removes the last chip. */
function ComboboxChipsInput({ className, onKeyDown, ...props }: React.ComponentProps<"input">) {
  const { search, setSearch, setOpen, open, values, remove, listRef, disabled, contentId } = useCombobox();
  return (
    <input
      data-slot="combobox-chips-input"
      role="combobox"
      aria-expanded={open}
      aria-controls={contentId}
      aria-autocomplete="list"
      disabled={disabled}
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        if (!open) setOpen(true);
      }}
      onFocus={() => setOpen(true)}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === "Backspace" && !search && values.length) remove(values[values.length - 1]);
        else if (["ArrowDown", "ArrowUp", "Enter", "Home", "End"].includes(e.key) && open && listRef.current) {
          e.preventDefault();
          // Hand the key to the list, which moves the highlight or picks the highlighted row.
          listRef.current.dispatchEvent(new KeyboardEvent("keydown", { key: e.key, bubbles: true, cancelable: true }));
        } else if (e.key === "ArrowDown" && !open) setOpen(true);
      }}
      className={cn("h-6 min-w-24 flex-1 bg-transparent px-1 font-sans text-body leading-tight text-fg caret-fg outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

/** A ref for an element the list should open from, when it is not the trigger (pass it to ComboboxContent's anchor). */
function useComboboxAnchor<T extends HTMLElement = HTMLDivElement>() {
  return React.useRef<T>(null);
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useCombobox,
  useComboboxAnchor,
};

```
