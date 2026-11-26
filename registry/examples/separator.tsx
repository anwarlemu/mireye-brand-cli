import { Separator } from "@/components/ui/separator";

export function Preview() {
  return (
    <div className="w-full max-w-96">
      <p className="text-body text-fg">Ellis County site 14</p>
      <p className="font-mono text-caption text-fg-muted">32.4113, -96.8302</p>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-body whitespace-nowrap text-fg">
        <span>Parcel</span>
        <Separator orientation="vertical" />
        <span>Power</span>
        <Separator orientation="vertical" />
        <span>Water</span>
      </div>
    </div>
  );
}

export function Strong() {
  return (
    <div className="grid w-full max-w-96 gap-3 text-body">
      <p className="text-caption text-fg-secondary">Requirements</p>
      <Separator strong />
      <p className="text-fg">200+ ac within Ellis County</p>
      <Separator />
      <p className="text-fg">138 kV substation within 2 mi</p>
    </div>
  );
}
