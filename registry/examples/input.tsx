import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Preview() {
  return (
    <div className="grid w-full max-w-96 gap-2">
      <Label htmlFor="parcel-size">Parcel size</Label>
      <Input id="parcel-size" placeholder="e.g. 40" inputMode="decimal" unit="ac" />
    </div>
  );
}

export function States() {
  return (
    <div className="grid w-full max-w-96 gap-4">
      <Input aria-label="Site name" placeholder="Site name" />
      <Input aria-label="Parcel ID" defaultValue="041-220-17" />
      <Input aria-label="Voltage" defaultValue="345" unit="kV" />
      <Input aria-label="County" defaultValue="Marion County" readOnly />
      <Input aria-label="Distance to substation" placeholder="Distance" disabled />
      <Input aria-label="Acreage" defaultValue="-4" aria-invalid />
    </div>
  );
}
