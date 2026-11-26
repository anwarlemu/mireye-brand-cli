"use client";

import * as React from "react";
import { CopyIcon, DownloadSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react/ssr";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

function Bar({ open }: { open?: boolean }) {
  const [labels, setLabels] = React.useState(true);
  const [basemap, setBasemap] = React.useState("survey");
  return (
    <Menubar defaultValue={open ? "site" : undefined}>
      <MenubarMenu value="site">
        <MenubarTrigger>Site</MenubarTrigger>
        <MenubarContent className="w-56">
          <MenubarGroup>
            <MenubarItem>
              <PlusIcon />
              New site
              <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              <CopyIcon />
              Duplicate
              <MenubarShortcut>⌘D</MenubarShortcut>
            </MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>
                <DownloadSimpleIcon />
                Export as
              </MenubarSubTrigger>
              <MenubarSubContent className="w-40">
                <MenubarItem>GeoJSON</MenubarItem>
                <MenubarItem>Shapefile</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarItem variant="destructive">
            <TrashIcon />
            Remove site
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent className="w-52">
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="map">
        <MenubarTrigger>Map</MenubarTrigger>
        <MenubarContent className="w-52">
          <MenubarCheckboxItem checked={labels} onCheckedChange={(v) => setLabels(v === true)}>
            Parcel labels
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarLabel>Basemap</MenubarLabel>
          <MenubarRadioGroup value={basemap} onValueChange={setBasemap}>
            <MenubarRadioItem value="survey">Survey</MenubarRadioItem>
            <MenubarRadioItem value="aerial">Aerial</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

export function Preview() {
  return <Bar />;
}

export function Open() {
  return (
    <div className="min-h-80">
      <Bar open />
    </div>
  );
}
