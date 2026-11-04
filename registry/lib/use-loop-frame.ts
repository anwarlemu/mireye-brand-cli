import * as React from "react";

/**
 * Steps through `count` frames while `running`, starting from `frame`. Returns `frame` when
 * not running or when the viewer prefers reduced motion. Every frame-based loader uses it
 * (NodeLoader, AgentSteps, ContourLoader, LineFillLoader).
 */
export function useLoopFrame(frame: number, count: number, running: boolean, ms: number) {
  const reduced = usePrefersReducedMotion();
  const [tick, setTick] = React.useState(frame);
  React.useEffect(() => {
    setTick(frame);
    if (!running || reduced) return;
    const id = window.setInterval(() => setTick((t) => (t + 1) % count), ms);
    return () => window.clearInterval(id);
  }, [frame, count, running, ms, reduced]);
  return running && !reduced ? tick : frame;
}

const QUERY = "(prefers-reduced-motion: reduce)";

/** Follows the reduced-motion setting live, so loaders stop when the viewer turns it on. */
export function usePrefersReducedMotion() {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
