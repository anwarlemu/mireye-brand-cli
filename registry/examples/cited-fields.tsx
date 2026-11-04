import { CitedFields, CitedField } from "@/components/ui/cited-fields";
import { Sources, Source, SourceGroup } from "@/components/ui/sources";

// Every value points at its source. Point at or focus a row and its source chip turns Forest,
// with the matching source; the other sources step back. No row gets a fill.
const FIELDS = [
  { label: "Flood zone", value: "Zone X", source: 1 },
  { label: "Elevation", value: "412 ft", source: 2 },
  { label: "Slope", value: "2.8%", source: 3 },
];
const SOURCES = ["FEMA flood hazard layer", "USGS 3DEP elevation model", "Slope, from the elevation model"];
const focus = "cursor-default outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-line-strong";

export function Preview() {
  return (
    <SourceGroup>
      <div className="flex w-full max-w-102 flex-col gap-6">
        <CitedFields>
          {FIELDS.map((f) => (
            <CitedField key={f.label} label={f.label} source={f.source} tabIndex={0} className={focus}>
              {f.value}
            </CitedField>
          ))}
        </CitedFields>
        <Sources aria-label="Sources">
          {SOURCES.map((s, i) => (
            <Source key={s} number={i + 1} cut={false} tabIndex={0} className={focus}>
              {s}
            </Source>
          ))}
        </Sources>
      </div>
    </SourceGroup>
  );
}
