"use client";

import * as React from "react";
import { BookOpenTextIcon, ChartLineIcon, DownloadSimpleIcon, GearSixIcon, LightningIcon, MapPinIcon, MapTrifoldIcon, PlusIcon, StackIcon } from "@phosphor-icons/react/ssr";

import { Button } from "@/components/ui/button";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command";

function Items({ onRun }: { onRun?: () => void }) {
  return (
    <>
      <CommandInput placeholder="Search sites, layers and pages" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Sites">
          <CommandItem onSelect={onRun}>
            <MapPinIcon />
            Site 14, Weld County
          </CommandItem>
          <CommandItem onSelect={onRun}>
            <MapPinIcon />
            Site 9, Larimer County
          </CommandItem>
          <CommandItem onSelect={onRun}>
            <PlusIcon />
            New site
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Layers">
          <CommandItem onSelect={onRun}>
            <StackIcon />
            Parcels
          </CommandItem>
          <CommandItem onSelect={onRun}>
            <LightningIcon />
            Substations
          </CommandItem>
          <CommandItem disabled>
            <MapTrifoldIcon />
            Wetlands (coming soon)
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Project">
          <CommandItem onSelect={onRun}>
            <ChartLineIcon />
            Fit scores
          </CommandItem>
          <CommandItem onSelect={onRun}>
            <DownloadSimpleIcon />
            Export shortlist
            <CommandShortcut>⌘E</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={onRun}>
            <GearSixIcon />
            Requirements
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={onRun}>
            <BookOpenTextIcon />
            Read the docs
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  );
}

export function Preview() {
  return (
    <Command className="mx-auto max-w-112">
      <Items />
    </Command>
  );
}

export function Dialog() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="grid justify-items-center gap-3">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open the command menu
      </Button>
      <p className="text-body text-fg-secondary">
        Or press <kbd className="border border-line bg-surface px-1.5 font-sans text-caption text-fg">⌘K</kbd>
      </p>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Items onRun={() => setOpen(false)} />
      </CommandDialog>
    </div>
  );
}

export function Open() {
  return (
    <div className="min-h-120">
      <CommandDialog defaultOpen>
        <Items />
      </CommandDialog>
    </div>
  );
}
