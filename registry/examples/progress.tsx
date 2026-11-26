"use client";

import * as React from "react";

import { Progress } from "@/components/ui/progress";

export function Preview() {
  const [value, setValue] = React.useState(24);
  React.useEffect(() => {
    // ds-latency: advances a presentation-only progress example; no user input is waiting.
    const t = setTimeout(() => setValue(62), 600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="w-full max-w-100">
      <Progress label="Loading terrain" value={value} />
    </div>
  );
}

export function Values() {
  return (
    <div className="grid w-full max-w-100 gap-6">
      <Progress value={0} aria-label="Parcels matched" />
      <Progress value={38} aria-label="Sources read" />
      <Progress value={100} aria-label="Report written" />
    </div>
  );
}
