import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar";

export function Preview() {
  return (
    <div className="grid gap-2">
      <div className="flex h-9 items-center gap-2.5">
        <Avatar size="sm">
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <span className="text-body text-fg">Acme Energy</span>
      </div>
      <div className="flex h-9 items-center gap-2.5">
        <Avatar size="sm">
          <AvatarImage src="/examples/map-aerial.jpg" alt="" />
          <AvatarFallback>E</AvatarFallback>
        </Avatar>
        <span className="text-body text-fg">Ellis County site 14</span>
      </div>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar size="sm">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src="/examples/farmland-aerial.jpg" alt="Aerial of the parcel" />
        <AvatarFallback>P</AvatarFallback>
      </Avatar>
    </div>
  );
}

export function WithBadge() {
  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>A</AvatarFallback>
        <AvatarBadge />
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src="/examples/map-aerial.jpg" alt="Aerial of the site" />
        <AvatarFallback>S</AvatarFallback>
        <AvatarBadge />
      </Avatar>
    </div>
  );
}

export function Group() {
  return (
    <AvatarGroup>
      <Avatar>
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>B</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>C</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  );
}
