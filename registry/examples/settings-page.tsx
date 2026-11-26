"use client";

import { SettingsPage } from "@/components/blocks/settings-page";

// Embedded at 900px; in an app the shell fills the viewport.
export function Preview() {
  return <SettingsPage className="h-225" />;
}
