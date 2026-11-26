"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export function Preview() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Toaster />
      <Button
        variant="outline"
        onClick={() =>
          toast("Site 14 removed", {
            description: "Its 6 parcels left the shortlist.",
            action: { label: "Undo", onClick: () => toast.success("Site 14 restored") },
          })
        }
      >
        Remove site
      </Button>
      <Button variant="outline" onClick={() => toast.success("Survey complete", { description: "212 acres in Weld County scored 86 against your requirements." })}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error("Export failed", { description: "The shapefile is over 50 MB. Export fewer parcels." })}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.warning("Floodplain overlap", { description: "18 acres of parcel 0412-07 sit in the 100-year floodplain." })}>
        Warning
      </Button>
      <Button variant="outline" onClick={() => toast.info("New county data", { description: "Larimer County parcels were updated on Oct 30." })}>
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          // ds-latency: demonstrates a pending notification; no control or input waits for the demo timer.
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1600)), {
            loading: "Scoring 24 sites...",
            success: "24 sites scored",
            error: "Could not score the sites",
          })
        }
      >
        Promise
      </Button>
    </div>
  );
}
