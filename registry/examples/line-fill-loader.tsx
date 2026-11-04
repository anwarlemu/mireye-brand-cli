import { LineFillLoader } from "@/components/ui/line-fill-loader";

// Data loading: a bell of lines travels left to right, like a chart filling in.
export function Preview() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-8">
      <LineFillLoader size={160} />
      <LineFillLoader />
    </div>
  );
}

// Figma's frames, still: the peak steps two lines a frame.
export function Frames() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-4">
      {[0, 1, 2, 3, 4].map((f) => (
        <LineFillLoader key={f} frame={f} running={false} />
      ))}
    </div>
  );
}
