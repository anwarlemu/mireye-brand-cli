import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function Preview() {
  return (
    <div className="grid w-full max-w-96 gap-2">
      <Label htmlFor="site-notes">Site notes</Label>
      <Textarea id="site-notes" placeholder="What should the agent look for?" />
    </div>
  );
}

export function States() {
  return (
    <div className="grid w-full max-w-96 gap-4">
      <Textarea aria-label="Notes" defaultValue="Flat, cleared land within 2 miles of a 345 kV line. Avoid the floodplain along the river." />
      <Textarea aria-label="Locked notes" defaultValue="Criteria are locked while the scan runs." readOnly />
      <Textarea aria-label="Disabled notes" placeholder="Notes" disabled />
      <Textarea aria-label="Invalid notes" defaultValue="?" aria-invalid />
    </div>
  );
}
