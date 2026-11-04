"use client";

import * as React from "react";

import { CheckIcon } from "@/components/icons/check";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

const BASEMAPS = [
  { id: "survey", title: "Survey", body: "Parcel lines and survey nodes on the canvas ground." },
  { id: "aerial", title: "Aerial", body: "Recent imagery, dimmed so parcels and tags read first." },
];

function ChooseBasemap({ onChoose }: { onChoose?: () => void }) {
  const [basemap, setBasemap] = React.useState("survey");
  return (
    <>
      <DrawerHeader>
        <DrawerTitle>Basemap</DrawerTitle>
        <DrawerDescription>Choose what the map shows under Site 14.</DrawerDescription>
      </DrawerHeader>
      <div role="radiogroup" aria-label="Basemap" className="grid gap-2 px-5">
        {BASEMAPS.map((b) => (
          <button
            key={b.id}
            type="button"
            role="radio"
            aria-checked={basemap === b.id}
            onClick={() => setBasemap(b.id)}
            className="flex items-center gap-3 border border-line bg-surface p-3 text-left outline-none transition-[background-color,border-color] duration-150 ease-out hover:bg-subtle active:bg-subtle-hover active:duration-0 focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong aria-checked:border-line-strong motion-reduce:transition-none"
          >
            <span className="grid flex-1 gap-1">
              <span className="text-body font-medium text-fg">{b.title}</span>
              <span className="text-body text-fg-secondary">{b.body}</span>
            </span>
            {basemap === b.id && <CheckIcon className="text-fg" />}
          </button>
        ))}
      </div>
      <DrawerFooter>
        <Button className="w-full" onClick={onChoose}>
          Use {basemap} basemap
        </Button>
        <DrawerClose asChild>
          <Button variant="ghost" className="w-full">
            Cancel
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </>
  );
}

export function Preview() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex justify-center">
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline">Choose a basemap</Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <ChooseBasemap onChoose={() => setOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export function Directions() {
  const directions = ["bottom", "top", "right", "left"] as const;
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {directions.map((direction) => (
        <Drawer key={direction} direction={direction}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="capitalize">
              {direction}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Drawer from the {direction}</DrawerTitle>
              <DrawerDescription>Drag it back toward its edge, or flick it, to close.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}

export function Open() {
  return (
    <div className="min-h-120">
      <Drawer defaultOpen>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <ChooseBasemap />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
