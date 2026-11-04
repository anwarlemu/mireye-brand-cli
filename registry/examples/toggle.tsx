import { MountainsIcon, StackIcon, WavesIcon } from "@phosphor-icons/react/ssr";

import { Toggle } from "@/components/ui/toggle";

export function Preview() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Show terrain" defaultPressed>
        <MountainsIcon />
        Terrain
      </Toggle>
      <Toggle aria-label="Show floodplain">
        <WavesIcon />
        Floodplain
      </Toggle>
    </div>
  );
}

export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle variant="outline" defaultPressed>
        <StackIcon />
        Parcel lines
      </Toggle>
      <Toggle variant="outline">Zoning</Toggle>
      <Toggle size="sm" aria-label="Show terrain">
        <MountainsIcon />
      </Toggle>
      <Toggle disabled>Wetlands</Toggle>
    </div>
  );
}
