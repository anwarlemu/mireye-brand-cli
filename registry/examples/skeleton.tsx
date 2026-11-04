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
