import { Diamond } from "@/components/ui/diamond";

export function Preview() {
  return (
    <div className="flex items-center gap-6 text-fg">
      <Diamond size={12} />
      <Diamond size={12} variant="outline" />
      <Diamond size={16} />
      <Diamond size={16} variant="outline" />
    </div>
  );
}
