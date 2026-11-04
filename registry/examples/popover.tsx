"use client";

import * as React from "react";
import { PencilSimpleIcon } from "@phosphor-icons/react/ssr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";

function RenameForm({ onDone }: { onDone?: () => void }) {
  const [name, setName] = React.useState("North Ault solar");
  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onDone?.();
      }}
    >
      <PopoverHeader>
        <PopoverTitle>Site name</PopoverTitle>
        <PopoverDescription>Shown on the map tag and in exports for Site 14.</PopoverDescription>
      </PopoverHeader>
      <div className="grid gap-1">
        <Label htmlFor="site-name">Name</Label>
        <Input id="site-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <Button type="submit" className="w-full">
        Save
      </Button>
    </form>
  );
}

export function Preview() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex justify-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <PencilSimpleIcon />
            Rename site
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <RenameForm onDone={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Opened once the trigger is on the page, so the panel is placed beside it (a popover open on the first render has no
// trigger to measure yet).
export function Open() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setOpen(true), []);
  return (
    <div className="flex min-h-80 items-start justify-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <PencilSimpleIcon />
            Rename site
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <RenameForm />
        </PopoverContent>
      </Popover>
    </div>
  );
}
