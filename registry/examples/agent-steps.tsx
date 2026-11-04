import { AgentSteps } from "@/components/ui/agent-steps";

// The agent at work, as it reports: each step appears when it starts and its label shimmers while it runs; a finished
// step settles back. After the last step the list holds, then a new run starts. In a product, pass each step's
// `status` from the run instead of `running`.
export function Preview() {
  return (
    <div className="flex justify-center">
      <AgentSteps steps={[{ label: "Matching the parcel" }, { label: "Checking the flood zone" }, { label: "Sampling elevation" }]} running live />
    </div>
  );
}

// Figma's list: every step shown, with status from the run.
export function Statuses() {
  return (
    <div className="flex justify-center">
      <AgentSteps
        steps={[
          { label: "Matched the parcel", status: "done" },
          { label: "Checking the flood zone", status: "current" },
          { label: "Sample elevation", status: "pending" },
        ]}
      />
    </div>
  );
}

// The small glyph, for a 64px tile or a collapsed run.
export function Glyph() {
  return (
    <div className="flex justify-center">
      <AgentSteps size="sm" running />
    </div>
  );
}
