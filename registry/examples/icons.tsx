import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { CheckIcon } from "@/components/icons/check";
import { ParcelIcon } from "@/components/icons/parcel-icon";
import { PlusIcon } from "@/components/icons/plus";

// Mireye's own glyphs, drawn from Figma: the button arrow and its head alone (the select's chevron), the check, the
// plus (turned 45 degrees it closes things) and the parcel. They take the text color.
export function Preview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 text-fg">
      <ArrowRightIcon />
      <ArrowRightIcon head className="rotate-90" />
      <CheckIcon />
      <PlusIcon />
      <PlusIcon className="rotate-45" />
      <ParcelIcon />
    </div>
  );
}

// In use: the parcel before a coordinate, the arrow after a label.
export function InText() {
  return (
    <div className="mx-auto flex w-fit flex-col gap-3 text-body text-fg">
      <span className="flex items-center gap-2">
        <ParcelIcon size={14} />
        <span className="ds-trim tabular-nums">32.1745, -96.8921</span>
      </span>
      <span className="flex items-center gap-3">
        <span className="ds-trim font-medium">Open the parcel record</span>
        <ArrowRightIcon size={16} />
      </span>
    </div>
  );
}
