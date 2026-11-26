"use client";

import * as React from "react";
import { CopyIcon, CrosshairIcon, FlagIcon, MapPinIcon, RulerIcon, StackIcon, TrashIcon } from "@phosphor-icons/react/ssr";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export function Preview() {
  const [shortlisted, setShortlisted] = React.useState(false);
  const [stage, setStage] = React.useState("screening");
  return (
    <ContextMenu>
      <ContextMenuTrigger className="mx-auto grid w-full max-w-96 gap-1 border border-line bg-surface p-3">
        <span className="flex justify-between text-body text-fg">
          Parcel 0412-07 <span className="text-fg-muted">212 acres</span>
        </span>
        <span className="text-body text-fg-secondary">Weld County, 2.1 mi to the Ault 230 kV substation</span>
        <span className="font-mono text-caption text-fg-muted">40.5853, −104.7322</span>
        <span className="mt-2 text-caption text-fg-muted">Right-click or long-press the parcel</span>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-60">
        <ContextMenuItem>
          <MapPinIcon />
          Show on map
          <ContextMenuShortcut>M</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <RulerIcon />
          Measure distance
          <ContextMenuShortcut>D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <CopyIcon />
          Copy coordinates
        </ContextMenuItem>
        <ContextMenuCheckboxItem checked={shortlisted} onCheckedChange={(v) => setShortlisted(v === true)}>
          Shortlisted
        </ContextMenuCheckboxItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <StackIcon />
            Move to stage
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuLabel>Stages</ContextMenuLabel>
            <ContextMenuRadioGroup value={stage} onValueChange={setStage}>
              <ContextMenuRadioItem value="screening">Screening</ContextMenuRadioItem>
              <ContextMenuRadioItem value="diligence">Diligence</ContextMenuRadioItem>
              <ContextMenuRadioItem value="option">Option signed</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <CrosshairIcon />
          Center the map here
        </ContextMenuItem>
        <ContextMenuItem>
          <FlagIcon />
          Flag for review
        </ContextMenuItem>
        <ContextMenuItem variant="destructive">
          <TrashIcon />
          Remove parcel
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
