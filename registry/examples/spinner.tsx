import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function Preview() {
  return (
    <div className="flex items-center gap-3 text-body text-fg-secondary">
      <Spinner />
      Matching the parcel
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex items-center gap-6">
      <Spinner />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  );
}

export function InButton() {
  return (
    <Button variant="outline" disabled>
      <Spinner aria-hidden />
      Sampling elevation
    </Button>
  );
}
