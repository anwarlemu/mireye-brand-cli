"use client";

import { DashboardPage } from "@/components/blocks/dashboard-page";

// Embedded at 900px; in an app the shell fills the viewport.
export function Preview() {
  return <DashboardPage className="h-225" />;
}
