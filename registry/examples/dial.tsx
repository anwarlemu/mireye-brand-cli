import { Dial } from "@/components/ui/dial";

export function Preview() {
  return (
    <div className="flex items-center gap-8">
      <Dial size={24} />
      <Dial size={36} />
      <Dial size={140} running={false} head={6} />
    </div>
  );
}
