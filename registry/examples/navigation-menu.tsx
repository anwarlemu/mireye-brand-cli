"use client";

import { BookOpenTextIcon, ChartLineIcon, LightningIcon, MapTrifoldIcon, PlugsIcon, StackIcon } from "@phosphor-icons/react/ssr";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const TOOLS = [
  { title: "Site search", body: "Find parcels that fit a project by acreage, slope and zoning.", icon: MapTrifoldIcon },
  { title: "Grid access", body: "Distance to substations and lines by kV, with spare capacity.", icon: LightningIcon },
  { title: "Interconnection", body: "Queue positions and study results for each point of interconnection.", icon: PlugsIcon },
  { title: "Fit score", body: "How well a site meets your requirements, and why.", icon: ChartLineIcon },
];

function Menu({ defaultValue }: { defaultValue?: string }) {
  return (
    <NavigationMenu defaultValue={defaultValue}>
      <NavigationMenuList>
        <NavigationMenuItem value="tools">
          <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[min(34rem,calc(100vw-2rem))] sm:grid-cols-2">
              {TOOLS.map(({ title, body, icon: Icon }) => (
                <li key={title}>
                  <NavigationMenuLink href={`#${title.toLowerCase().replace(/ /g, "-")}`}>
                    <span className="flex items-center gap-2 font-medium">
                      <Icon />
                      {title}
                    </span>
                    <span className="text-fg-secondary">{body}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="data">
          <NavigationMenuTrigger>Data</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[min(16rem,calc(100vw-2rem))]">
              <li>
                <NavigationMenuLink href="#layers">
                  <span className="flex items-center gap-2 font-medium">
                    <StackIcon />
                    Layers
                  </span>
                  <span className="text-fg-secondary">Parcels, floodplain, wetlands and land cover.</span>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#sources">
                  <span className="flex items-center gap-2 font-medium">
                    <BookOpenTextIcon />
                    Sources
                  </span>
                  <span className="text-fg-secondary">Where each value comes from, and when it was read.</span>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#docs" className={navigationMenuTriggerStyle()}>
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function Preview() {
  return (
    <div className="flex justify-center">
      <Menu />
    </div>
  );
}

export function Open() {
  return (
    <div className="flex min-h-80 items-start justify-center">
      <Menu defaultValue="tools" />
    </div>
  );
}
