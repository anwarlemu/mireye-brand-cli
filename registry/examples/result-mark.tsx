import { RESULT_LABELS, ResultLabel, ResultMark, type CheckResult } from "@/components/ui/result-mark";

// The four results of a requirement check: a solid diamond is a confirmed reading, an outline is no reading, three
// bars are a screen still running. The word always says the outcome.
const RESULTS = Object.keys(RESULT_LABELS) as CheckResult[];

export function Preview() {
  return (
    <ul className="mx-auto flex w-fit flex-col gap-3">
      {RESULTS.map((r) => (
        <li key={r} className="flex items-center gap-2 text-caption text-fg">
          <ResultMark result={r} />
          <ResultLabel result={r} />
        </li>
      ))}
    </ul>
  );
}
