import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// A note in the flow of a page, drawn as Mireye's cut frame: a 1px line around white with the 8px chamfer at the
// top-left, 16px sides and 12px above and below. A 16px Phosphor glyph (regular weight) or a Diamond leads, 12px before
// the words; the title is 13px medium in Forest, the description 13px in Forest at 80%. It fills the width it is given.
// - `default` (also `info`): the Stone line, Forest glyph.
// - `success`, `warning`, `destructive`: the line and the glyph in the chosen status colour, the words stay Forest so
//   they read. Use them sparingly; Figma has no risk state yet.
// - `muted`: Fog with no line, for a note inside a white panel.
// Nothing moves.
const alertVariants = cva(
  "group/alert relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 px-4 py-3 font-sans text-body leading-body text-fg has-[>svg]:grid-cols-[auto_minmax(0,1fr)_auto] [&>svg]:mt-px [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "ds-cut-frame [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] [&>svg]:text-fg",
        info: "ds-cut-frame [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] [&>svg]:text-fg",
        success: "ds-cut-frame [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-status-success)] [&>svg]:text-success",
        warning: "ds-cut-frame [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-status-warning)] [&>svg]:text-warning",
        destructive: "ds-cut-frame [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-status-danger)] [&>svg]:text-danger [&>[data-slot=alert-title]]:text-danger",
        muted: "ds-cut [--ds-shape-fill:var(--ds-color-bg-subtle)] [&>svg]:text-fg",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" data-variant={variant ?? "default"} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("col-start-1 min-w-0 font-medium group-has-[>svg]/alert:col-start-2", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("col-start-1 min-w-0 text-fg-secondary group-has-[>svg]/alert:col-start-2 [&_p]:leading-body", className)} {...props} />;
}

/** What sits at the right of an alert: a short note or a button. Below the words on a phone. */
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-center text-right text-caption text-fg-muted group-has-[>svg]/alert:col-start-3 max-sm:col-start-1 max-sm:col-end-[-1] max-sm:row-span-1 max-sm:row-start-3 max-sm:mt-1 max-sm:text-left max-sm:group-has-[>svg]/alert:col-start-2",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertAction, AlertDescription, AlertTitle, alertVariants };
