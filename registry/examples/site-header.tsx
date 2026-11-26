"use client";

import { SiteHeader } from "@/components/blocks/site-header";

export function Preview() {
  return (
    <div className="h-64">
      <SiteHeader current="#pricing" />
    </div>
  );
}
