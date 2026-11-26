"use client";

import { ListDetailPage } from "@/components/blocks/list-detail-page";

// Embedded at 900px; in an app the shell fills the viewport.
export function Preview() {
  return <ListDetailPage className="h-225" />;
}
