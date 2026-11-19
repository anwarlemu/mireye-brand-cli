"use client";

import { AppShell } from "@/components/blocks/app-shell";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

// Embedded at 800px; in an app the shell fills the viewport.
export function Preview() {
  return (
    <AppShell
      className="h-200"
      current="reports"
      breadcrumb={["Workspace"]}
      title="Reports"
      meta="0 reports"
      actions={<Button size="sm">New report</Button>}
    >
      <div className="grid h-full place-items-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No reports yet</EmptyTitle>
            <EmptyDescription>Open a saved site and choose Open report to write one.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </AppShell>
  );
}
