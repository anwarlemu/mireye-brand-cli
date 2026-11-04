import { ParcelScan } from "@/components/ui/parcel-scan";

// A site loading on the map: the parcel's corners stamp, its outline traces itself, the survey lines reach the edges
// and the hatch sweeps in, on a live USGS aerial tile. Offline, the same drawing runs on the Forest ground.
export function Preview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <ParcelScan />
      <ParcelScan size="sm" />
    </div>
  );
}

// Figma's still frames: the white map tile with its contours, and the small parcel.
export function Still() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <ParcelScan running={false} />
      {[0, 2, 4].map((f) => (
        <ParcelScan key={f} size="sm" running={false} frame={f} />
      ))}
    </div>
  );
}
