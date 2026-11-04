import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble";

export function Preview() {
  return (
    <div className="mx-auto flex w-full max-w-120 flex-col gap-4">
      <Bubble align="end">
        <BubbleContent>Check flood risk and terrain for this parcel.</BubbleContent>
      </Bubble>
      <Bubble variant="ghost">
        <BubbleContent>The parcel is in Zone X, outside the 100-year flood plain. It sits at 412 ft with a 2.8% average slope.</BubbleContent>
      </Bubble>
      <BubbleGroup>
        <Bubble variant="secondary">
          <BubbleContent>Elevation came from the 10 m model.</BubbleContent>
        </Bubble>
        <Bubble variant="secondary">
          <BubbleContent>Slope is computed from the same model.</BubbleContent>
          <BubbleReactions align="start">2 sources</BubbleReactions>
        </Bubble>
      </BubbleGroup>
    </div>
  );
}

export function Variants() {
  return (
    <div className="mx-auto flex w-full max-w-120 flex-col gap-3">
      <Bubble variant="muted">
        <BubbleContent>Search widened to 25 mi.</BubbleContent>
      </Bubble>
      <Bubble variant="inverse" align="end">
        <BubbleContent>Shortlist Ellis County site 14.</BubbleContent>
      </Bubble>
      <Bubble variant="destructive" align="end">
        <BubbleContent>Not answered. The elevation source did not respond.</BubbleContent>
      </Bubble>
      <Bubble align="end">
        <BubbleContent asChild>
          <button type="button">Ask again</button>
        </BubbleContent>
      </Bubble>
    </div>
  );
}
