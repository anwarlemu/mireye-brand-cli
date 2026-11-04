import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

function Pane({ label, className }: { label: string; className?: string }) {
  return <div className={"flex h-full items-center justify-center p-6 text-body text-fg-muted " + (className ?? "")}>{label}</div>;
}

export function Preview() {
  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-64 max-w-2xl overflow-hidden border border-line bg-surface">
      <ResizablePanel defaultSize={36} minSize={20}>
        <Pane label="Sites" className="bg-page" />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={64} minSize={30}>
        <Pane label="Map" />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export function Nested() {
  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-72 max-w-2xl overflow-hidden border border-line bg-surface">
      <ResizablePanel defaultSize={30} minSize={15}>
        <Pane label="Saved searches" className="bg-page" />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={70}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={40} minSize={20}>
            <Pane label="Map" />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60} minSize={20}>
            <Pane label="Site report" />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
