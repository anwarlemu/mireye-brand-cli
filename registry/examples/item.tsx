import { DropIcon, FileTextIcon, LightningIcon, MapTrifoldIcon, MountainsIcon, StackIcon } from "@phosphor-icons/react/ssr";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item";

const SITES = [
  { name: "Ellis County site 14", at: "32.4113, -96.8302", acres: "212.6 ac", kv: "345 kV" },
  { name: "Navarro County site 3", at: "32.0954, -96.4689", acres: "305.0 ac", kv: "138 kV" },
  { name: "Kaufman County site 8", at: "32.5890, -96.3087", acres: "198.2 ac", kv: "138 kV" },
];

export function Preview() {
  return (
    <ItemGroup className="w-full max-w-110">
      {SITES.map((site, i) => (
        <div key={site.name}>
          {i > 0 && <ItemSeparator />}
          <Item asChild aria-current={i === 0 ? "true" : undefined}>
            <a href="#site">
              <ItemMedia variant="image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/examples/farmland-aerial.jpg" alt="" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{site.name}</ItemTitle>
                <ItemDescription className="font-mono">{site.at}</ItemDescription>
              </ItemContent>
              <ItemActions className="max-sm:hidden">
                <Badge>{site.acres}</Badge>
                <Badge>{site.kv}</Badge>
              </ItemActions>
            </a>
          </Item>
        </div>
      ))}
    </ItemGroup>
  );
}

export function Sources() {
  return (
    <ItemGroup className="w-full max-w-110">
      {[
        { title: "Flood zone map", meta: "National flood hazard layer, Oct 2026" },
        { title: "Elevation model", meta: "10 m elevation model" },
        { title: "Parcel records", meta: "Ellis County appraisal district" },
      ].map((source, i) => (
        <div key={source.title}>
          {i > 0 && <ItemSeparator />}
          <Item asChild>
            <button type="button" className="w-full text-left">
              <ItemHeader className="justify-start gap-2 text-caption text-fg-muted">
                <span className="tabular-nums">{i + 1}</span>
                <span>Source</span>
              </ItemHeader>
              <ItemContent>
                <ItemTitle>{source.title}</ItemTitle>
                <ItemDescription>{source.meta}</ItemDescription>
              </ItemContent>
            </button>
          </Item>
        </div>
      ))}
    </ItemGroup>
  );
}

export function Rail() {
  const rows = [
    { label: "Map", icon: MapTrifoldIcon, current: true },
    { label: "Saved sites", icon: StackIcon },
    { label: "Reports", icon: FileTextIcon },
    { label: "Power", icon: LightningIcon },
    { label: "Water", icon: DropIcon },
  ];
  return (
    <ItemGroup className="w-full max-w-53 gap-0.5">
      {rows.map(({ label, icon: Icon, current }) => (
        <Item key={label} size="sm" asChild aria-current={current ? "page" : undefined}>
          <a href={`#${label}`}>
            <ItemMedia variant="icon">
              <Icon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{label}</ItemTitle>
            </ItemContent>
          </a>
        </Item>
      ))}
    </ItemGroup>
  );
}

export function Variants() {
  return (
    <div className="grid w-full max-w-120 gap-3">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <MountainsIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Terrain</ItemTitle>
          <ItemDescription>412 ft average elevation, 2.8% slope</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="icon" aria-label="Open terrain details">
            <ArrowRightIcon size={16} />
          </Button>
        </ItemActions>
      </Item>
      <Item variant="muted" size="sm">
        <ItemMedia variant="icon">
          <LightningIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>345 kV substation, 0.8 mi east</ItemTitle>
        </ItemContent>
      </Item>
      <Item size="xs">
        <ItemContent>
          <ItemTitle>Queue position: open</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  );
}
