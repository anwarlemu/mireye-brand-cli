import { MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";

import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceNode, TraceTitle } from "@/components/ui/trace";

export function Preview() {
  return (
    <Trace className="mx-auto max-w-120">
      <TraceLine>
        <TraceNode />
        <TraceTitle>Matched the parcel</TraceTitle>
        <TraceDescription>0.8s</TraceDescription>
      </TraceLine>
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceNode />
            <TraceTitle>Checked the flood zone</TraceTitle>
            <TraceDescription>1 layer</TraceDescription>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          Parcel <span className="font-mono text-caption text-fg">042-117-09</span> falls in Zone X on the national flood hazard layer.
        </TraceCollapsibleContent>
      </TraceCollapsible>
      <TraceLine status="running">
        <TraceNode />
        <TraceTitle>Sampling elevation and slope</TraceTitle>
      </TraceLine>
      <TraceLine status="pending">
        <TraceNode />
        <TraceTitle>Writing the report</TraceTitle>
      </TraceLine>
    </Trace>
  );
}

export function Failed() {
  return (
    <Trace className="mx-auto max-w-120">
      <TraceLine>
        <TraceIcon>
          <MagnifyingGlassIcon />
        </TraceIcon>
        <TraceTitle>Searched Ellis County parcels</TraceTitle>
        <TraceDescription>38 results</TraceDescription>
      </TraceLine>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine status="error">
            <TraceNode />
            <TraceTitle>Elevation model did not respond</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          The source answered <span className="font-mono text-caption text-fg">503 Service Unavailable</span>. Slope and elevation are left out of this answer.
        </TraceCollapsibleContent>
      </TraceCollapsible>
      <TraceLine>
        <TraceNode />
        <TraceTitle>Retry scheduled</TraceTitle>
        <TraceDescription>in 30s</TraceDescription>
      </TraceLine>
    </Trace>
  );
}

export function Linked() {
  return (
    <Trace className="mx-auto max-w-120">
      <a href="#parcel">
        <TraceLine>
          <TraceNode />
          <TraceTitle>Opened parcel 042-117-09</TraceTitle>
        </TraceLine>
      </a>
      <button type="button">
        <TraceLine>
          <TraceNode />
          <TraceTitle>Compared with Navarro County site 3</TraceTitle>
        </TraceLine>
      </button>
    </Trace>
  );
}
