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
