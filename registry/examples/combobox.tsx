"use client";

import * as React from "react";
import { PlusIcon } from "@phosphor-icons/react/ssr";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useCombobox,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";

const COUNTIES = [
  { value: "marion-or", label: "Marion County", detail: "OR" },
  { value: "linn-or", label: "Linn County", detail: "OR" },
  { value: "lane-or", label: "Lane County", detail: "OR" },
  { value: "maricopa-az", label: "Maricopa County", detail: "AZ" },
  { value: "travis-tx", label: "Travis County", detail: "TX" },
  { value: "loudoun-va", label: "Loudoun County", detail: "VA", disabled: true },
];

const LAYERS = ["Parcels", "Substations", "Transmission lines", "Floodplain", "Wetlands", "Zoning", "Roads", "Rail", "Fiber"];

export function Preview() {
  const [county, setCounty] = React.useState<string | null>("marion-or");
  return (
    <div className="grid w-full max-w-80 gap-2">
      <Label id="county-label">County</Label>
      <Combobox items={COUNTIES} value={county} onValueChange={setCounty}>
        <ComboboxTrigger aria-labelledby="county-label">
          <ComboboxValue placeholder="Choose a county" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search counties" />
          <ComboboxList>
            <ComboboxEmpty>No county by that name.</ComboboxEmpty>
            {COUNTIES.map((c) => (
              <ComboboxItem key={c.value} value={c.value} label={c.label} detail={c.detail} disabled={c.disabled} />
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function Multiple() {
  const [layers, setLayers] = React.useState<string[]>(["Parcels", "Substations"]);
  return (
    <div className="grid w-full max-w-100 gap-2">
      <Label htmlFor="layers">Map layers</Label>
      <Combobox multiple items={LAYERS} value={layers} onValueChange={setLayers} name="layers">
        <ComboboxChips>
          {layers.map((l) => (
            <ComboboxChip key={l} value={l} />
          ))}
          <ComboboxChipsInput id="layers" placeholder={layers.length ? "" : "Add layers"} />
          <ComboboxClear />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxList>{(item) => <ComboboxItem value={item.value}>{item.label}</ComboboxItem>}</ComboboxList>
          <ComboboxEmpty>No such layer.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

// The "Create" row reads the search from the combobox and offers it as a new value; choosing it calls onValueChange.
function CreateRow({ known }: { known: string[] }) {
  const { search } = useCombobox();
  const value = search.trim().toLowerCase();
  if (!value || known.includes(value)) return null;
  return (
    <>
      <ComboboxSeparator />
      <ComboboxItem value={value} label={value}>
        <PlusIcon />
        Create &ldquo;{value}&rdquo;
      </ComboboxItem>
    </>
  );
}

export function Creatable() {
  const [tags, setTags] = React.useState(["shortlist", "needs survey", "rejected"]);
  const [tag, setTag] = React.useState<string | null>(null);
  return (
    <div className="grid w-full max-w-80 gap-1">
      <Label id="tag-label">Site tag</Label>
      <Combobox items={tags} value={tag} onValueChange={(v) => {
        if (v && !tags.includes(v)) setTags((t) => [...t, v]);
        setTag(v);
      }}>
        <ComboboxTrigger aria-labelledby="tag-label">
          <ComboboxValue placeholder="Add a tag" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search or create a tag" />
          <ComboboxList>
            {tags.map((t) => (
              <ComboboxItem key={t} value={t}>
                {t}
              </ComboboxItem>
            ))}
            <CreateRow known={tags} />
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function Groups() {
  const [site, setSite] = React.useState<string | null>(null);
  return (
    <div className="grid w-full max-w-80 gap-2">
      <Label id="site-label">Compare with</Label>
      <Combobox
        value={site}
        onValueChange={setSite}
        items={[
          { value: "041-220-17", label: "041-220-17" },
          { value: "041-310-02", label: "041-310-02" },
          { value: "north-campus", label: "North campus" },
        ]}
      >
        <ComboboxTrigger aria-labelledby="site-label">
          <ComboboxValue placeholder="Choose a site" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search sites" searching />
          <ComboboxList>
            <ComboboxEmpty />
            <ComboboxGroup heading="Parcels">
              <ComboboxItem value="041-220-17" detail="41.2 ac">041-220-17</ComboboxItem>
              <ComboboxItem value="041-310-02" detail="88.0 ac">041-310-02</ComboboxItem>
            </ComboboxGroup>
            <ComboboxSeparator />
            <ComboboxGroup heading="Saved sites">
              <ComboboxItem value="north-campus" detail="3 parcels">North campus</ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function States() {
  return (
    <div className="grid w-full max-w-80 gap-4">
      <Combobox items={COUNTIES} defaultValue="marion-or" disabled>
        <ComboboxTrigger aria-label="Locked county" />
      </Combobox>
      <div className="grid gap-2">
        <Combobox items={COUNTIES}>
          <ComboboxTrigger aria-label="Required county" aria-invalid>
            <ComboboxValue placeholder="Choose a county" />
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxInput placeholder="Search counties" />
            <ComboboxList>{(c) => <ComboboxItem value={c.value}>{c.label}</ComboboxItem>}</ComboboxList>
          </ComboboxContent>
        </Combobox>
        <p className="m-0 text-caption leading-line-caption text-danger">Choose the county to search.</p>
      </div>
    </div>
  );
}
