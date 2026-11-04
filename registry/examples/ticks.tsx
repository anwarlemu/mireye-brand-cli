import { Ticks } from "@/components/ui/ticks";

export function Preview() {
  return (
    <div className="grid w-full max-w-80 gap-4">
      <Ticks pitch={6} value={0.62} on="var(--ds-color-border-strong)" off="var(--ds-color-border-default)" className="h-4 w-full" />
      <Ticks pitch={4} className="h-1.5 w-24 text-fg" />
    </div>
  );
}
