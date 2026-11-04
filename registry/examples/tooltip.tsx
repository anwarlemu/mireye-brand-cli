import { CrosshairIcon, InfoIcon, MinusIcon, PlusIcon, RulerIcon } from "@phosphor-icons/react/ssr";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TOOLS = [
  { label: "Zoom in", icon: PlusIcon },
  { label: "Zoom out", icon: MinusIcon },
  { label: "Measure distance", icon: RulerIcon },
  { label: "Center on site", icon: CrosshairIcon },
];

export function Preview() {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {TOOLS.map(({ label, icon: Icon }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={label}>
                <Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

export function Info() {
  return (
    <div className="flex min-h-40 items-start justify-center pt-14">
      <p className="flex items-center gap-1.5 text-body text-fg">
        Spare capacity
        <Tooltip defaultOpen>
          <TooltipTrigger className="text-fg-secondary outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong" aria-label="About spare capacity">
            <InfoIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent side="top">From the utility's last interconnection study, in MW.</TooltipContent>
        </Tooltip>
      </p>
    </div>
  );
}
