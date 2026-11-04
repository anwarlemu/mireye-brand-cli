"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// A form's fields in Mireye's layout (Figma "UI · Inputs", 442:107, at the product scale). A field is its 12px label in
// 80% Forest, 8px above the control; fields sit 16px apart. A description under the control is 12px in 72% Forest 8px
// below it ("Within 40 to 120 ac"); an error is 12px brick 8px below it. A legend is 16px Forest, the size of a section
// title. "or" between two ways in is 12px between two Mist rules, 12px from each. A field marked data-invalid keeps its
// label: only the control's line and the message turn brick. A label that wraps a whole field is a choice card: the
// cut frame, its line Forest and its fill Fog while its control is checked.
function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return <fieldset data-slot="field-set" className={cn("m-0 flex min-w-0 flex-col gap-4 border-0 p-0 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3", className)} {...props} />;
}

function FieldLegend({ className, variant = "legend", ...props }: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn("mb-2 p-0 font-sans font-normal text-fg data-[variant=label]:text-caption data-[variant=label]:leading-line-caption data-[variant=label]:text-fg-secondary data-[variant=legend]:text-h3 data-[variant=legend]:leading-heading", className)}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-group" className={cn("group/field-group @container/field-group flex w-full flex-col gap-4 [&>[data-slot=field-group]]:gap-4", className)} {...props} />;
}

const fieldVariants = cva("group/field flex w-full gap-2", {
  variants: {
    orientation: {
      // Label over control (Email address over its field).
      vertical: "flex-col [&>*]:w-full [&>.sr-only]:w-auto",
      // Label beside its control (a channel row and its switch, a checkbox and its label).
      horizontal: "flex-row items-center gap-3 [&>[data-slot=field-label]]:flex-auto has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[data-slot=checkbox],&>[data-slot=radio-group-item],&>[data-slot=switch]]:mt-px",
      // Over on a narrow form, beside from 28rem of container.
      responsive: "flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:gap-3 @md/field-group:[&>*]:w-auto @md/field-group:[&>[data-slot=field-label]]:flex-auto",
    },
  },
  defaultVariants: { orientation: "vertical" },
});

function Field({ className, orientation = "vertical", ...props }: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return <div role="group" data-slot="field" data-orientation={orientation} className={cn(fieldVariants({ orientation }), className)} {...props} />;
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-content" className={cn("group/field-content flex min-w-0 flex-1 flex-col gap-1", className)} {...props} />;
}

// A label that wraps a whole field becomes a choice card: the cut frame, 12px in; the checked one takes the Forest line
// on Fog.
function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2",
        "has-[>[data-slot=field]]:ds-cut-frame has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:text-body has-[>[data-slot=field]]:text-fg *:data-[slot=field]:p-3",
        "has-[>[data-slot=field]]:[--ds-shape-stroke:var(--ds-color-border-default)] has-[>[data-slot=field]]:[--ds-shape-fill:var(--ds-color-bg-default)] has-[>[data-slot=field]]:after:transition-[background-color] has-[>[data-slot=field]]:after:duration-fast has-[>[data-slot=field]]:after:ease-out motion-reduce:after:transition-none",
        "has-[>[data-slot=field]]:hover:[--ds-shape-fill:var(--ds-color-bg-subtle)] has-data-[state=checked]:[--ds-shape-stroke:var(--ds-color-border-strong)] has-data-[state=checked]:[--ds-shape-fill:var(--ds-color-bg-subtle)]",
        className,
      )}
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-title" className={cn("flex w-fit items-center gap-2 font-sans text-body leading-line-body font-normal text-fg group-data-[disabled=true]/field:text-fg-subtle", className)} {...props} />;
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "m-0 font-sans text-caption leading-line-caption font-normal text-fg-muted group-has-[[data-orientation=horizontal]]/field:text-balance [[data-variant=legend]+&]:-mt-1 [&>a]:text-fg [&>a]:underline [&>a]:decoration-line [&>a]:underline-offset-4 [&>a:hover]:decoration-line-strong",
        className,
      )}
      {...props}
    />
  );
}

/** The "or" between two ways in: a 12px word in 72% Forest between two Mist rules. */
function FieldSeparator({ children, className, ...props }: React.ComponentProps<"div"> & { children?: React.ReactNode }) {
  return (
    <div data-slot="field-separator" data-content={!!children} className={cn("relative flex h-4 items-center gap-3 text-caption leading-line-caption", className)} {...props}>
      <div aria-hidden className="h-px flex-1 bg-line-subtle" />
      {children && (
        <span data-slot="field-separator-content" className="shrink-0 text-fg-muted">
          {children}
        </span>
      )}
      {children && <div aria-hidden className="h-px flex-1 bg-line-subtle" />}
    </div>
  );
}

function FieldError({ className, children, errors, ...props }: React.ComponentProps<"div"> & { errors?: Array<{ message?: string } | undefined> }) {
  const content = React.useMemo(() => {
    if (children) return children;
    if (!errors?.length) return null;
    const unique = [...new Map(errors.map((error) => [error?.message, error])).values()];
    if (unique.length === 1) return unique[0]?.message;
    return <ul className="m-0 flex list-disc flex-col gap-0.5 pl-4">{unique.map((error, index) => error?.message && <li key={index}>{error.message}</li>)}</ul>;
  }, [children, errors]);
  if (!content) return null;
  return (
    <div role="alert" data-slot="field-error" className={cn("font-sans text-caption leading-line-caption font-normal text-danger", className)} {...props}>
      {content}
    </div>
  );
}

export { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle };
