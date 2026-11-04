import { MireyeMark } from "@/components/ui/mireye-mark";

// The logomark takes the text color, so it follows its ground.
export function Preview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <MireyeMark className="h-auto w-12" />
      <span className="flex size-24 items-center justify-center bg-inverse">
        <MireyeMark className="h-auto w-12 text-fg-inverse" />
      </span>
      <span data-brand="enterprise" className="flex size-24 items-center justify-center bg-page">
        <MireyeMark className="h-auto w-12" />
      </span>
    </div>
  );
}

// Beside a product name, as in a panel header.
export function Lockup() {
  return (
    <span className="mx-auto flex w-fit items-center gap-2 text-fg">
      <MireyeMark className="h-auto w-4" />
      <span className="ds-trim text-body">Ask Mireye</span>
    </span>
  );
}
