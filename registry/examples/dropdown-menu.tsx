"use client";

import * as React from "react";
import { CopyIcon, DotsThreeIcon, DownloadSimpleIcon, MapPinIcon, PencilSimpleIcon, ShareNetworkIcon, StackIcon, TrashIcon } from "@phosphor-icons/react/ssr";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function SiteItems() {
  return (
    <>
      <DropdownMenuLabel>Site 14, Weld County</DropdownMenuLabel>
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <MapPinIcon />
          Show on map
          <DropdownMenuShortcut>M</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CopyIcon />
          Copy coordinates
          <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <DownloadSimpleIcon />
            Export as
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>GeoJSON</DropdownMenuItem>
            <DropdownMenuItem>Shapefile</DropdownMenuItem>
            <DropdownMenuItem>CSV</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem>
          <ShareNetworkIcon />
          Share with Acme
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem disabled>Request survey (admins only)</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive">
        <TrashIcon />
        Remove site
      </DropdownMenuItem>
    </>
  );
}

export function Preview() {
  return (
    <div className="flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Site actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <SiteItems />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Opened once the trigger is on the page, so the panel is placed under it (a menu open on the first render has no
// trigger to measure yet).
export function Open() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setOpen(true), []);
  return (
    <div className="flex min-h-100 items-start justify-center">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Site actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60">
          <SiteItems />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function RowActions() {
  return (
    <div className="flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Actions for parcel 0412-07">
            <DotsThreeIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <PencilSimpleIcon />
            Rename parcel
          </DropdownMenuItem>
          <DropdownMenuItem>
            <StackIcon />
            Merge with neighbor
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <TrashIcon />
            Remove parcel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function Options() {
  const [layers, setLayers] = React.useState({ parcels: true, substations: true, floodplain: false });
  const [unit, setUnit] = React.useState("acres");
  return (
    <div className="flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Map layers</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Layers</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={layers.parcels} onCheckedChange={(v) => setLayers((l) => ({ ...l, parcels: v === true }))}>
            Parcels
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={layers.substations} onCheckedChange={(v) => setLayers((l) => ({ ...l, substations: v === true }))}>
            Substations
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={layers.floodplain} onCheckedChange={(v) => setLayers((l) => ({ ...l, floodplain: v === true }))}>
            Floodplain
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Area in</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={unit} onValueChange={setUnit}>
            <DropdownMenuRadioItem value="acres">Acres</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="hectares">Hectares</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
