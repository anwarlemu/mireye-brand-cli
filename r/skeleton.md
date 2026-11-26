# Skeleton
A square Fog block in the shape of what will load, breathing toward Mist; it shows only after 450ms.

Install: npx mireye-ds add skeleton
Requires: theme, utils
Packages: none
Exports: Skeleton
Client boundary: not required by this entry file
Reference: Built from the palette: Fog and Mist, Figma's hover and pressed fills (442:2)


## Usage
Use in the shape of what will load: table rows with their site image and tags, cited fields, a card's values. Match each part's size; everything is square. It waits before it appears, so a quick load never flashes it.
- Avoid: Rounded skeletons
- Avoid: Shimmer gradients across blocks
- Avoid: Skeletons for content already on screen
- Avoid: A skeleton for a single button


## Examples
Example components: npx mireye-ds add skeleton
[Preview](https://mireye-ds.agencidev.com/preview/skeleton/Preview) | [Values](https://mireye-ds.agencidev.com/preview/skeleton/Values)

examples/skeleton.tsx

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export function Preview() {
  return (
    <div className="grid w-full max-w-110" aria-busy="true" aria-label="Loading sites">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-4 border-b border-line-subtle py-3">
          <Skeleton className="h-11 w-14" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

export function Values() {
  return (
    <div className="grid w-full max-w-110 gap-3" aria-busy="true" aria-label="Loading cited fields">
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid grid-cols-[8rem_1fr] items-center gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      ))}
    </div>
  );
}

```

## Source

components/ui/skeleton.tsx

```tsx
import { cn } from "@/lib/utils";

// A placeholder in the shape of what will load: a square Fog block that breathes toward Mist (1.6s each way, the
// in-out curve, opacity only). It appears only after 450ms (an instant fade held back three fast steps), so a quick
// load never flashes it. Under reduced motion the block holds still. For a wait with no shape, use Spinner (the Dial).
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(
        "relative overflow-hidden bg-subtle [animation:ds-fade-in_0s_linear_calc(var(--ds-duration-fast)*3)_backwards] after:absolute after:inset-0 after:bg-subtle-hover after:opacity-0 after:content-[''] after:animate-pulse-soft motion-reduce:after:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };

```
