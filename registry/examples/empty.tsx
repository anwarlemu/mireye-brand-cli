import { MagnifyingGlassIcon, MapPinIcon } from "@phosphor-icons/react/ssr";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMark, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export function Preview() {
  return (
    <Empty className="min-h-90">
      <EmptyMedia>
        <EmptyMark />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No sites yet</EmptyTitle>
        <EmptyDescription>Describe the land you need, and matching sites appear here with their sources.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Start a search</Button>
      </EmptyContent>
    </Empty>
  );
}

export function NoResults() {
  return (
    <Empty className="min-h-72">
      <EmptyMedia variant="icon">
        <MagnifyingGlassIcon />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No parcels match</EmptyTitle>
        <EmptyDescription>Nothing in Ellis County is over 200 ac within 2 mi of 138 kV. Widen the radius or lower the voltage.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline">Edit requirements</Button>
      </EmptyContent>
    </Empty>
  );
}

export function NoSelection() {
  return (
    <Empty className="min-h-72">
      <EmptyMedia variant="icon">
        <MapPinIcon />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No site selected</EmptyTitle>
        <EmptyDescription>Choose a site on the map to read its report.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
