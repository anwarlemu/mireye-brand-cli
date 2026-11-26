import { Dial } from "@/components/ui/dial";

// The dial at its three sizes, turning: 24px inside an icon key, 36px inline, 140px where a whole panel waits (Figma
// sizes; they render at 0.6). One tick a step, a turn every 1.2s.
export function Preview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-7">
      <Dial size={140} />
      <Dial size={36} />
      <Dial size={24} />
    </div>
  );
}

// Still, as under reduced motion: the head holds where `head` puts it.
export function Still() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-7">
      <Dial size={140} running={false} head={6} />
      <Dial size={36} running={false} />
      <Dial size={24} running={false} />
    </div>
  );
}
