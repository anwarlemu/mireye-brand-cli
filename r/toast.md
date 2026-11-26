# Toast
The Radix toast drawn as the Sonner toasts: a Bone panel with the 8px cut corner and a 1px Stone line, a 6px Forest diamond, a 13px medium title and a square framed action; destructive is drawn in brick.

Install: npx mireye-ds add toast
Requires: theme, diamond, utils
Packages: radix-ui, class-variance-authority, @phosphor-icons/react
Exports: Toast, ToastAction, ToastClose, ToastDescription, Toaster, ToastProvider, ToastTitle, ToastViewport, toast, useToast, ToastActionElement, ToastProps
Client boundary: yes
Reference: Not in Figma. Drawn in Mireye's grammar: the Sonner toasts


## Usage
Use where an app already uses shadcn's useToast API. Prefer Sonner for new work.
- Avoid: A new toast system beside Sonner
- Avoid: Rounded corners or a shadow
- Avoid: More than one action


## Examples
Example components: npx mireye-ds add toast button
[Preview](https://mireye-ds.agencidev.com/preview/toast/Preview)

examples/toast.tsx

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { ToastAction, Toaster, useToast } from "@/components/ui/toast";

export function Preview() {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Toaster />
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Site 14 archived",
            description: "It no longer appears in search or on the map.",
            action: <ToastAction altText="Undo the archive">Undo</ToastAction>,
          })
        }
      >
        Archive site
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            variant: "destructive",
            title: "Export failed",
            description: "The county server answered 500 three times.",
            action: <ToastAction altText="Retry the export">Retry</ToastAction>,
          })
        }
      >
        Destructive
      </Button>
      <Button variant="outline" onClick={() => toast({ title: "Requirements saved" })}>
        Title only
      </Button>
    </div>
  );
}

```

## Source

components/ui/toast.tsx

```tsx
"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "@phosphor-icons/react/ssr";

import { Diamond } from "@/components/ui/diamond";

import { cn } from "@/lib/utils";

// The Radix toast (shadcn's older toast API; prefer Sonner for new work). Same look as the Sonner toasts (Figma has none;
// this is Mireye's grammar): a white panel with the 8px cut corner and a 1px Stone line, no shadow, 16px of padding, a
// 6px Forest diamond before a 13px medium Forest title over a 13px line in the secondary ink, a square 32px white
// framed action key and the toast close key (a square 24px key with a 16px X, Fog under the pointer, Mist while
// pressed). `destructive` draws the line, the diamond and the title in brick. It slides in from the right edge it lives
// on (300ms, the drawer curve) and fades out faster (120ms); a swipe to the right drags it with the finger and lets it
// go.
const ToastProvider = ToastPrimitive.Provider;

function ToastViewport({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn("fixed right-0 bottom-0 z-[100] flex max-h-dvh w-full flex-col-reverse gap-2 p-4 outline-none sm:max-w-sm sm:flex-col", className)}
      {...props}
    />
  );
}

const toastVariants = cva(
  "group/toast ds-cut-frame pointer-events-auto flex w-full items-start justify-between gap-3 overflow-hidden p-4 pr-10 font-sans text-fg [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong data-[state=closed]:animate-fade-out data-[state=open]:animate-sheet-in-right data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[translate] data-[swipe=cancel]:duration-200 data-[swipe=cancel]:ease-out data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=end]:animate-fade-out data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=move]:transition-none motion-reduce:data-[swipe=cancel]:transition-none",
  {
    variants: {
      variant: {
        default: "",
        destructive: "[--ds-shape-stroke:var(--ds-color-status-danger)] [&_[data-slot=toast-title]]:text-danger-strong [&_[data-slot=toast-mark]]:text-danger",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Toast({ className, variant, ...props }: React.ComponentProps<typeof ToastPrimitive.Root> & VariantProps<typeof toastVariants>) {
  return <ToastPrimitive.Root data-slot="toast" data-variant={variant ?? "default"} className={cn(toastVariants({ variant }), className)} {...props} />;
}

function ToastAction({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Action>) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center self-center border border-line bg-surface px-3 font-sans text-body leading-tight font-medium text-fg outline-none transition-[background-color] duration-150 ease-out hover:bg-subtle active:bg-subtle-hover active:duration-0 focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong disabled:pointer-events-none disabled:bg-subtle-hover disabled:text-fg-subtle group-data-[variant=destructive]/toast:text-danger-strong motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function ToastClose({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close"
      className={cn("absolute top-2 right-2 inline-flex size-6 items-center justify-center text-fg outline-none transition-[background-color] duration-150 ease-out hover:bg-subtle active:bg-subtle-hover active:duration-0 focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-line-strong motion-reduce:transition-none", className)}
      {...props}
    >
      <XIcon className="size-4" />
    </ToastPrimitive.Close>
  );
}

function ToastTitle({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Title>) {
  return <ToastPrimitive.Title data-slot="toast-title" className={cn("text-body leading-tight font-medium text-fg", className)} {...props} />;
}

function ToastDescription({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Description>) {
  return <ToastPrimitive.Description data-slot="toast-description" className={cn("text-body leading-body text-fg-secondary", className)} {...props} />;
}

type ToastProps = React.ComponentProps<typeof Toast>;
type ToastActionElement = React.ReactElement<React.ComponentProps<typeof ToastAction>>;

// The toast queue: a tiny store any part of the app can push to with toast(), read by useToast() and <Toaster />.
const TOAST_LIMIT = 3;
const REMOVE_DELAY = 1000;

type ToasterToast = ToastProps & { id: string; title?: React.ReactNode; description?: React.ReactNode; action?: ToastActionElement };
type State = { toasts: ToasterToast[] };

let count = 0;
const nextId = () => String((count = (count + 1) % Number.MAX_SAFE_INTEGER));
const listeners: Array<(state: State) => void> = [];
let memory: State = { toasts: [] };
const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

function setState(update: (state: State) => State) {
  memory = update(memory);
  listeners.forEach((l) => l(memory));
}

function scheduleRemove(id: string) {
  if (timeouts.has(id)) return;
  // ds-latency: removes an already dismissed toast from memory; dismissal and input stay immediate.
  timeouts.set(id, setTimeout(() => {
    timeouts.delete(id);
    setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  }, REMOVE_DELAY));
}

function dismiss(id?: string) {
  setState((s) => ({ toasts: s.toasts.map((t) => (id === undefined || t.id === id ? { ...t, open: false } : t)) }));
  memory.toasts.filter((t) => id === undefined || t.id === id).forEach((t) => scheduleRemove(t.id));
}

function toast(props: Omit<ToasterToast, "id">) {
  const id = nextId();
  const update = (next: Partial<ToasterToast>) => setState((s) => ({ toasts: s.toasts.map((t) => (t.id === id ? { ...t, ...next } : t)) }));
  setState((s) => ({
    toasts: [{ ...props, id, open: true, onOpenChange: (open: boolean) => { if (!open) dismiss(id); props.onOpenChange?.(open); } }, ...s.toasts].slice(0, TOAST_LIMIT),
  }));
  return { id, dismiss: () => dismiss(id), update };
}

function useToast() {
  const [state, setLocal] = React.useState(memory);
  React.useEffect(() => {
    listeners.push(setLocal);
    return () => {
      const i = listeners.indexOf(setLocal);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);
  return { ...state, toast, dismiss };
}

/** Renders the queue. Mount it once, near the root. */
function Toaster() {
  const { toasts } = useToast();
  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <span data-slot="toast-mark" className="flex h-4.5 shrink-0 items-center text-fg">
            <Diamond size={10} />
          </span>
          <div className="grid min-w-0 flex-1 gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}

export { Toast, ToastAction, ToastClose, ToastDescription, Toaster, ToastProvider, ToastTitle, ToastViewport, toast, useToast };
export type { ToastActionElement, ToastProps };

```
