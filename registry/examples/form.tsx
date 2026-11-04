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
