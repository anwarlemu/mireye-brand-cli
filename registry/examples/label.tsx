import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Preview() {
  return (
    <div className="grid w-full max-w-80 gap-6">
      <div className="grid gap-2">
        <Label htmlFor="location">
          Location <span data-slot="label-required" aria-hidden>*</span>
        </Label>
        <Input id="location" placeholder="Search any U.S. location" />
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="floodplain" defaultChecked />
        <Label htmlFor="floodplain">Exclude floodplain</Label>
      </div>
    </div>
  );
}
