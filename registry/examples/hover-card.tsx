import { LightningIcon, MapPinIcon } from "@phosphor-icons/react/ssr";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

function SubstationCard() {
  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <p className="text-body font-medium text-fg">Ault substation</p>
        <p className="text-body text-fg-secondary">230 kV, owned by Acme Transmission. About 40 MW of spare capacity in the last study.</p>
      </div>
      <div className="grid gap-1.5 border-t border-line-subtle pt-3">
        <p className="flex items-center gap-2 text-body text-fg">
          <LightningIcon className="size-4 text-fg-secondary" /> 2.1 mi from Site 14
        </p>
        <p className="flex items-center gap-2 font-mono text-caption text-fg-secondary">
          <MapPinIcon className="size-4" /> 40.5853, −104.7322
        </p>
      </div>
    </div>
  );
}

const LINK = "text-fg underline decoration-line underline-offset-4 transition-[text-decoration-color] duration-150 ease-out hover:decoration-line-strong";

export function Preview() {
  return (
    <p className="max-w-96 text-body text-fg">
      Site 14 ties in at the{" "}
      <HoverCard>
        <HoverCardTrigger href="#ault" className={LINK}>
          Ault substation
        </HoverCardTrigger>
        <HoverCardContent>
          <SubstationCard />
        </HoverCardContent>
      </HoverCard>{" "}
      along an existing county road.
    </p>
  );
}

export function Open() {
  return (
    <div className="flex min-h-60 items-start justify-center">
      <HoverCard defaultOpen>
        <HoverCardTrigger href="#ault" className={LINK}>
          Ault substation
        </HoverCardTrigger>
        <HoverCardContent>
          <SubstationCard />
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
