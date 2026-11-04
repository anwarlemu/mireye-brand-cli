import { ContourLoader, LineFillLoader } from "@/components/ui/loader";

// The two drawn loaders, side by side: contours while terrain loads, lines while data loads.
export function Preview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <span className="flex flex-col items-center gap-3">
        <ContourLoader size={200} />
        <span className="ds-trim text-caption text-fg-muted">Loading terrain</span>
      </span>
      <span className="flex flex-col items-center gap-3">
        <LineFillLoader size={160} />
        <span className="ds-trim text-caption text-fg-muted">Loading parcel data</span>
      </span>
    </div>
  );
}
