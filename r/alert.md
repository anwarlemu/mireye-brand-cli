# Alert
A note in the cut frame: a 1px line around Bone with the chamfer at the top-left, a 16px glyph, a medium title and a secondary description. The line takes a status colour for success, warning and errors; muted is Fog.

Install: npx mireye-ds add alert
Requires: theme, utils
Packages: class-variance-authority
Exports: Alert, AlertAction, AlertDescription, AlertTitle, alertVariants
Client boundary: not required by this entry file
Reference: Not in Figma (no risk or warning state yet): the cut frame of UI · Agent chat (443:433) with the chosen status colours, for a designer's review


## Usage
Use default for a fact the person should know before reading on (values are cited), warning for data that is partial or stale, success for a finished report, destructive for a source that failed. Lead with a Phosphor glyph at regular weight. Put a short note or one button in AlertAction. Use muted inside a Bone panel.
- Avoid: Coloured fills
- Avoid: Rounded corners
- Avoid: More than one alert for one message
- Avoid: A bold title
- Avoid: Colour without words


## Examples
Example components: npx mireye-ds add alert button
Example packages: @phosphor-icons/react
[Preview](https://mireye-ds.agencidev.com/preview/alert/Preview) | [Muted](https://mireye-ds.agencidev.com/preview/alert/Muted) | [Warning](https://mireye-ds.agencidev.com/preview/alert/Warning) | [Success](https://mireye-ds.agencidev.com/preview/alert/Success) | [Destructive](https://mireye-ds.agencidev.com/preview/alert/Destructive)

examples/alert.tsx

```tsx
import { CheckCircleIcon, InfoIcon, WarningIcon, XCircleIcon } from "@phosphor-icons/react/ssr";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function Preview() {
  return (
    <Alert className="max-w-160">
      <InfoIcon />
      <AlertTitle>Values are cited</AlertTitle>
      <AlertDescription>Every value in a report links to the record it came from: county parcels, the interconnection queue or the elevation model.</AlertDescription>
    </Alert>
  );
}

export function Muted() {
  return (
    <Alert variant="muted" className="max-w-160">
      <InfoIcon />
      <AlertDescription>Parcels under 5 ac are left out of results for this buy box.</AlertDescription>
    </Alert>
  );
}

export function Warning() {
  return (
    <Alert variant="warning" className="max-w-160">
      <WarningIcon />
      <AlertTitle>Partial data for Navarro County</AlertTitle>
      <AlertDescription>Zoning is not published for 14 of its parcels.</AlertDescription>
      <AlertAction>Updated Oct 28</AlertAction>
    </Alert>
  );
}

export function Success() {
  return (
    <Alert variant="success" className="max-w-160">
      <CheckCircleIcon />
      <AlertTitle>Report ready</AlertTitle>
      <AlertDescription>Ellis County site 14 meets 9 of 9 requirements.</AlertDescription>
    </Alert>
  );
}

export function Destructive() {
  return (
    <Alert variant="destructive" className="max-w-160">
      <XCircleIcon />
      <AlertTitle>The elevation source did not respond</AlertTitle>
      <AlertDescription>Slope and elevation are missing from this answer. Try again in a few minutes.</AlertDescription>
      <AlertAction>
        <Button variant="outline" size="sm">Retry</Button>
      </AlertAction>
    </Alert>
  );
}

```

## Source

components/ui/alert.tsx

```tsx
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

```
