import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";

export function Preview() {
  return (
    <div className="grid gap-2">
      <Label htmlFor="ns-state">State</Label>
      <NativeSelect id="ns-state" defaultValue="or" className="w-60">
        <NativeSelectOptGroup label="West">
          <NativeSelectOption value="or">Oregon</NativeSelectOption>
          <NativeSelectOption value="wa">Washington</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="South">
          <NativeSelectOption value="tx">Texas</NativeSelectOption>
          <NativeSelectOption value="ga">Georgia</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    </div>
  );
}

export function States() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <NativeSelect size="sm" aria-label="Sort parcels" defaultValue="fit" className="w-48">
        <NativeSelectOption value="fit">Best fit</NativeSelectOption>
        <NativeSelectOption value="size">Largest first</NativeSelectOption>
      </NativeSelect>
      <NativeSelect aria-label="Locked state" disabled className="w-48">
        <NativeSelectOption>Oregon</NativeSelectOption>
      </NativeSelect>
      <NativeSelect aria-label="Zoning" aria-invalid className="w-48">
        <NativeSelectOption value="">Choose a zoning</NativeSelectOption>
        <NativeSelectOption value="i2">I-2 Industrial</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}
