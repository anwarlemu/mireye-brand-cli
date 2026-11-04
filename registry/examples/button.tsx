"use client";

import * as React from "react";
import { DownloadSimpleIcon, MapPinIcon, TrashIcon } from "@phosphor-icons/react/ssr";

import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";

export function Preview() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button arrow>Find sites</Button>
      <Button variant="outline" arrow>
        Compare parcels
      </Button>
      <Button variant="ghost" arrow>
        View report
      </Button>
      <Button variant="outline" size="icon" aria-label="Add a site">
        <PlusIcon />
      </Button>
    </div>
  );
}

export function Variants() {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button>Save criteria</Button>
        <Button variant="outline">
          <DownloadSimpleIcon />
          Export parcels
        </Button>
        <Button variant="secondary">Skip</Button>
        <Button variant="destructive">
          <TrashIcon />
          Delete site
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost">Clear filters</Button>
        <Button variant="ghost" size="icon" aria-label="Locate the parcel">
          <MapPinIcon />
        </Button>
        <Button variant="link">Read the zoning notes</Button>
      </div>
    </div>
  );
}

// A loading key walks its tick bar and keeps its size; an icon key turns the Dial; the text button shimmers.
export function Loading() {
  const [loading, setLoading] = React.useState(true);
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button arrow loading={loading} className="w-40 justify-between">
          Find sites
        </Button>
        <Button variant="outline" arrow loading={loading} className="w-40 justify-between">
          Find sites
        </Button>
        <Button variant="outline" size="icon" aria-label="Add a site" loading={loading}>
          <PlusIcon />
        </Button>
        <Button variant="ghost" arrow loading={loading}>
          Scanning parcels
        </Button>
      </div>
      <div>
        <Button variant="link" onClick={() => setLoading((l) => !l)}>
          {loading ? "Stop loading" : "Start loading"}
        </Button>
      </div>
    </div>
  );
}

export function States() {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button arrow disabled>
          Find sites
        </Button>
        <Button variant="outline" arrow disabled>
          Find sites
        </Button>
        <Button variant="ghost" arrow disabled>
          Find sites
        </Button>
        <Button variant="outline" size="icon" aria-label="Add a site" disabled>
          <PlusIcon />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" arrow>
          Ask
        </Button>
        <Button arrow>Find sites</Button>
        <Button size="lg" arrow>
          Find sites
        </Button>
      </div>
    </div>
  );
}
