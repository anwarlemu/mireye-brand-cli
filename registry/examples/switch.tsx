import { Switch } from "@/components/ui/switch";

export function Preview() {
  return (
    <div className="grid gap-3">
      <Switch defaultChecked>Terrain</Switch>
      <Switch>Parcel lines</Switch>
    </div>
  );
}

export function States() {
  return (
    <div className="grid gap-3">
      <Switch size="sm" defaultChecked>
        Labels
      </Switch>
      <Switch disabled>Live traffic</Switch>
      <Switch disabled defaultChecked>
        County boundary
      </Switch>
    </div>
  );
}
