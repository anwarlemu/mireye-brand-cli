"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

function EditRequirements() {
  return (
    <>
      <SheetHeader>
        <SheetTitle>Edit requirements</SheetTitle>
        <SheetDescription>Every site in the project is scored against these.</SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 px-5">
        <div className="grid gap-1">
          <Label htmlFor="sheet-acres">Minimum acres</Label>
          <Input id="sheet-acres" inputMode="numeric" defaultValue="200" />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="sheet-kv">Substation within (miles)</Label>
          <Input id="sheet-kv" inputMode="decimal" defaultValue="3" />
        </div>
      </div>
      <SheetFooter>
        <Button className="w-full">Save requirements</Button>
      </SheetFooter>
    </>
  );
}

export function Preview() {
  return (
    <div className="flex justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Edit requirements</Button>
        </SheetTrigger>
        <SheetContent>
          <EditRequirements />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function Sides() {
  const sides = ["top", "right", "bottom", "left"] as const;
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {sides.map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="outline" className="capitalize">
              {side}
            </Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Sheet from the {side}</SheetTitle>
              <SheetDescription>Slides from its edge on the drawer curve.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}

export function Open() {
  return (
    <div className="min-h-120">
      <Sheet defaultOpen>
        <SheetContent>
          <EditRequirements />
        </SheetContent>
      </Sheet>
    </div>
  );
}
