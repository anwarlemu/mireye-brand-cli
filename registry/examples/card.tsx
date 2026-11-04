import { DropIcon, LightningIcon, MountainsIcon } from "@phosphor-icons/react/ssr";

import { Badge, BadgeMark } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function Preview() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>
            <LightningIcon />
            Power
          </CardTitle>
          <CardDescription>Nearest substation 0.8 mi east, 138 kV, with capacity on the queue.</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <DropIcon />
            Water
          </CardTitle>
          <CardDescription>Municipal main along the north edge. Outside the 100-year flood zone.</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <MountainsIcon />
            Terrain
          </CardTitle>
          <CardDescription>412 ft average elevation, 2.8% slope.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export function Site() {
  return (
    <Card className="w-full max-w-110">
      <CardHeader>
        <CardTitle>Ellis County site 14</CardTitle>
        <CardDescription className="font-mono text-caption">32.4113, -96.8302</CardDescription>
        <CardAction>
          <Badge variant="outline">
            <BadgeMark state="verified" />
            Verified
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Badge>212.6 ac</Badge>
        <Badge>138 kV</Badge>
        <Badge>Zone X</Badge>
        <Badge>I-2 Industrial</Badge>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="outline">Open report</Button>
      </CardFooter>
    </Card>
  );
}

export function Variants() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <Card variant="muted">
        <CardHeader>
          <CardTitle>Buy box</CardTitle>
          <CardDescription>200+ ac, 138 kV within 2 mi, outside flood zones.</CardDescription>
        </CardHeader>
      </Card>
      <Card variant="inverse">
        <CardHeader>
          <CardTitle>Best fit</CardTitle>
          <CardDescription>Parcel 042-117-09 meets 9 of 9 requirements.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export function Small() {
  return (
    <Card size="sm" className="w-full max-w-72">
      <CardHeader>
        <CardTitle>Last surveyed</CardTitle>
        <CardDescription>Oct 28, 2026, 4:12 PM</CardDescription>
      </CardHeader>
    </Card>
  );
}
