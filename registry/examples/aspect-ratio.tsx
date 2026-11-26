import { AspectRatio } from "@/components/ui/aspect-ratio";

export function Preview() {
  return (
    <figure className="m-0 grid w-full max-w-120 gap-2">
      <AspectRatio ratio={16 / 9} className="overflow-hidden bg-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/examples/farmland-aerial.jpg" alt="Aerial of farmland around the parcel" className="size-full object-cover" />
      </AspectRatio>
      <figcaption className="flex justify-between text-caption text-fg-muted">
        Ellis County site 14
        <span className="font-mono">32.4113, -96.8302</span>
      </figcaption>
    </figure>
  );
}

export function Square() {
  return (
    <div className="w-40">
      <AspectRatio ratio={1} className="relative overflow-hidden bg-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/examples/map-aerial.jpg" alt="" className="ds-imagery size-full object-cover" />
        <span aria-hidden className="absolute inset-[28%] border border-bone" />
      </AspectRatio>
    </div>
  );
}
