import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const COUNTIES = ["Ellis", "Johnson", "Kaufman", "Navarro", "Hill", "Rockwall", "Hunt", "Henderson", "Collin", "Denton", "Parker", "Wise", "Hood", "Somervell", "Bosque", "Limestone", "Freestone", "Anderson"];

export function Preview() {
  return (
    <ScrollArea className="ds-cut-frame h-72 w-64 [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]">
      <div className="p-4">
        <p className="mb-3 text-caption text-fg-secondary">Counties in range</p>
        {COUNTIES.map((county, i) => (
          <div key={county}>
            {i > 0 && <Separator className="my-2" />}
            <p className="flex justify-between text-body text-fg">
              {county}
              <span className="font-mono text-caption text-fg-muted">{(i * 7 + 3) % 40} sites</span>
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export function Horizontal() {
  return (
    <ScrollArea className="w-full max-w-96 whitespace-nowrap">
      <div className="flex w-max gap-2 pb-3">
        {["345 kV", "212.6 ac", "Zone X", "I-2 Industrial", "2.8% slope", "412 ft", "0.8 mi to substation", "Municipal water"].map((tag) => (
          <span key={tag} className="flex h-6 items-center bg-tag px-2 text-caption text-tag-fg">
            {tag}
          </span>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
