import { NodeLoader } from "@/components/ui/node-loader";

// Three survey nodes filling in turn: inline (Figma's 20px) and in a chat line (Figma's 8px).
export function Preview() {
  return (
    <div className="flex flex-col items-center gap-6">
      <NodeLoader />
      <p role="status" className="flex items-center gap-2 text-body text-fg-secondary">
        <NodeLoader size="sm" />
        <span className="ds-trim">Reading the parcel's records</span>
      </p>
    </div>
  );
}

// Figma's five frames, still.
export function Frames() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      {[0, 1, 2, 3, 4].map((f) => (
        <NodeLoader key={f} frame={f} running={false} />
      ))}
    </div>
  );
}
