# Form
A react-hook-form form in Mireye's field layout: each FormItem is a 12px label, the control 8px under it, then a 12px description or a brick message. A failing field turns only its control's line and its message brick.

Install: npx mireye-ds add form
Requires: theme, label, utils
Packages: @chakra-ui/react, react-hook-form
Exports: Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField
Client boundary: yes
Reference: Drawn from Figma "UI · Inputs" (442:107)


## Usage
Use for a form with validation, such as site criteria. Wrap the control in FormControl so it gets the id, aria-describedby and aria-invalid; put FormMessage last. End with one default key with `arrow`, and set its `loading` while the form submits.
- Avoid: Validating on every keystroke before the first submit
- Avoid: A message that replaces the label
- Avoid: More than one default key


## Examples
Example components: npx mireye-ds add form button checkbox input radio-group range textarea
Example packages: react-hook-form
[Preview](https://mireye-ds.agencidev.com/preview/form/Preview)

examples/form.tsx

```tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Range } from "@/components/ui/range";
import { Textarea } from "@/components/ui/textarea";

type Values = { name: string; county: string; size: string; voltage: string; use: "industrial" | "agricultural"; floodplain: boolean; notes: string };

// Site criteria: what the agent searches for. An empty submit shows each field's message; a valid one saves.
export function Preview() {
  const form = useForm<Values>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { name: "", county: "", size: "41.2", voltage: "", use: "industrial", floodplain: true, notes: "" },
  });
  const [saved, setSaved] = React.useState<string | null>(null);
  const size = Number.parseFloat(form.watch("size"));

  async function onSubmit(values: Values) {
    // A local example: a real form would save the criteria to the API here.
    setSaved(values.name);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mx-auto grid w-full max-w-110 gap-4">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "Name the site so the team can find it." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Acme data center, phase 2" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="county"
          rules={{ required: "Choose where to search." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>County</FormLabel>
              <FormControl>
                <Input placeholder="Search any U.S. county" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="size"
          rules={{
            required: "Give a minimum size.",
            validate: (v) => (Number.parseFloat(v) >= 40 && Number.parseFloat(v) <= 120) || "Use a size from 40 to 120 ac.",
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parcel size</FormLabel>
              <FormControl>
                <Input inputMode="decimal" unit="ac" {...field} />
              </FormControl>
              <Range
                min={40}
                max={120}
                step={0.1}
                value={Number.isNaN(size) ? 40 : size}
                onValueChange={(v) => form.setValue("size", String(v), { shouldValidate: form.formState.isSubmitted })}
                aria-label="Parcel size"
                helper="Within 40 to 120 ac"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="voltage"
          rules={{ pattern: { value: /^\d*$/, message: "Use whole kilovolts." } }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum line voltage</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 138" inputMode="numeric" unit="kV" {...field} />
              </FormControl>
              <FormDescription>Leave empty to include every line.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="use"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zoning</FormLabel>
              <FormControl>
                <RadioGroup value={field.value} onValueChange={(v) => field.onChange(v)} className="grid-cols-2">
                  <RadioGroupItem value="industrial">Industrial</RadioGroupItem>
                  <RadioGroupItem value="agricultural">Agricultural</RadioGroupItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="floodplain"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)}>
                  Exclude floodplain
                </Checkbox>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes for the agent</FormLabel>
              <FormControl>
                <Textarea placeholder="Anything else the site needs" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button type="submit" arrow loading={form.formState.isSubmitting}>
            Save criteria
          </Button>
          <Button type="button" variant="ghost" onClick={() => { form.reset(); setSaved(null); }}>
            Reset
          </Button>
          <p role="status" className="m-0 text-caption leading-line-caption text-fg-muted">
            {saved ? `Saved ${saved}.` : ""}
          </p>
        </div>
      </form>
    </Form>
  );
}

```

## Source

components/ui/form.tsx

```tsx
"use client";

import * as React from "react";
import { chakra } from "@chakra-ui/react";
import { Controller, FormProvider, useFormContext, useFormState, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// A react-hook-form form in Mireye's field layout (Figma "UI · Inputs", 442:107, at the product scale). Each FormItem is
// a field: its 12px label in 80% Forest, 8px above the control. A FormDescription is 12px in 72% Forest 8px under the
// control ("Within 40 to 120 ac"); a FormMessage is a 12px brick line 8px under it. A field that fails keeps its label:
// only the control's line (aria-invalid) and the message turn brick. Stack FormItems 16px apart.
const Form = FormProvider;

type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = { name: TName };

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

function FormField<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

type FormItemContextValue = { id: string };

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

/** The state of the field around it: its ids for labels and messages, and react-hook-form's error, dirty and touched state. */
function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  if (!fieldContext) throw new Error("useFormField should be used within <FormField>");
  if (!itemContext) throw new Error("useFormField should be used within <FormItem>");
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;
  return { id, name: fieldContext.name, formItemId: `${id}-form-item`, formDescriptionId: `${id}-form-item-description`, formMessageId: `${id}-form-item-message`, ...fieldState };
}

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("grid min-w-0 gap-2", className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField();
  return <Label data-slot="form-label" data-error={!!error} htmlFor={formItemId} className={cn("w-fit", className)} {...props} />;
}

/** Hands the field's id, its description and message ids and aria-invalid to the one control inside it. */
function FormControl(props: React.ComponentProps<typeof chakra.div>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return <chakra.div data-slot="form-control" id={formItemId} aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`} aria-invalid={!!error} {...props} />;
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();
  return <p data-slot="form-description" id={formDescriptionId} className={cn("m-0 font-sans text-caption leading-line-caption text-fg-muted", className)} {...props} />;
}

function FormMessage({ className, children, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? "") : children;
  if (!body) return null;
  return (
    <p data-slot="form-message" id={formMessageId} role={error ? "alert" : undefined} className={cn("m-0 font-sans text-caption leading-line-caption text-danger", className)} {...props}>
      {body}
    </p>
  );
}

export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField };

```
