import { Badge, BadgeMark } from "@/components/ui/badge";

export function Preview() {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">
          <BadgeMark state="verified" />
          Verified
        </Badge>
        <Badge variant="outline">
          <BadgeMark state="loading" />
          Loading
        </Badge>
        <Badge variant="outline">
          <BadgeMark state="queued" />
          Queued
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>345 kV</Badge>
        <Badge>41.2 ac</Badge>
        <Badge>Zone X</Badge>
        <Badge>I-2 Industrial</Badge>
      </div>
    </div>
  );
}

export function Tags() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>138 kV</Badge>
      <Badge variant="secondary">Unzoned</Badge>
      <Badge variant="inverse">Best fit</Badge>
      <Badge variant="ghost">2 sources</Badge>
    </div>
  );
}

export function Count() {
  return (
    <span className="flex items-center gap-2 text-body text-fg">
      Saved sites
      <Badge variant="count">12</Badge>
    </span>
  );
}

export function Status() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="success">Passes</Badge>
      <Badge variant="warning">Partial data</Badge>
      <Badge variant="destructive">In a flood zone</Badge>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge size="sm">Zone X</Badge>
      <Badge>Zone X</Badge>
      <Badge size="lg">Zone X</Badge>
      <Badge variant="link" asChild>
        <a href="#parcel">Parcel 042-117-09</a>
      </Badge>
    </div>
  );
}
