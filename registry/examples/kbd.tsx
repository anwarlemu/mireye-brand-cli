import { Kbd, KbdGroup } from "@/components/ui/kbd";

export function Preview() {
  return (
    <div className="grid gap-3 text-body text-fg-secondary">
      <p className="m-0 flex items-center gap-2">
        Search sites
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </p>
      <p className="m-0 flex items-center gap-2">
        Next parcel <Kbd>J</Kbd> Previous parcel <Kbd>K</Kbd>
      </p>
    </div>
  );
}
