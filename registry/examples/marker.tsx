import { MagnifyingGlassIcon, StackIcon } from "@phosphor-icons/react/ssr";

import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";

export function Preview() {
  return (
    <div className="mx-auto grid w-full max-w-120 gap-5">
      <Marker variant="separator">
        <MarkerContent>Yesterday</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>
          <MagnifyingGlassIcon />
        </MarkerIcon>
        <MarkerContent>Search widened to 25 mi from Waxahachie</MarkerContent>
      </Marker>
      <Marker variant="unread">
        <MarkerContent>3 new sites</MarkerContent>
      </Marker>
    </div>
  );
}

export function Variants() {
  return (
    <div className="mx-auto grid w-full max-w-120 gap-5">
      <Marker variant="border">
        <MarkerContent>Saved searches</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>
          <StackIcon />
        </MarkerIcon>
        <MarkerContent>
          Ellis County site 14 added to Shortlist. <a href="#shortlist">View shortlist</a>
        </MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Oct 28</MarkerContent>
      </Marker>
    </div>
  );
}
