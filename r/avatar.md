# Avatar
Square tiles: one Forest initial on Fog, or an image filling the square, with a diamond status node and a group.

Install: npx mireye-ds add avatar
Requires: theme, diamond, utils
Packages: @chakra-ui/react
Exports: Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage
Client boundary: yes
Reference: Not in Figma: square because Mireye has no circles; Fog and Forest from the palette (331:37), for a designer's review


## Usage
Use for an organisation, a team member or a site's thumbnail beside its name (size sm is 24px in rows). Always give an AvatarFallback with one uppercase initial. AvatarBadge marks someone or something live with a Fern diamond; AvatarGroup lists who shares a project, with AvatarGroupCount for the rest.
- Avoid: Circles
- Avoid: Overlapping avatars
- Avoid: Gradient or random-coloured fallbacks
- Avoid: Two-letter initials
- Avoid: Bold initials


## Examples
Example components: npx mireye-ds add avatar
[Preview](https://mireye-ds.agencidev.com/preview/avatar/Preview) | [Sizes](https://mireye-ds.agencidev.com/preview/avatar/Sizes) | [WithBadge](https://mireye-ds.agencidev.com/preview/avatar/WithBadge) | [Group](https://mireye-ds.agencidev.com/preview/avatar/Group)

examples/avatar.tsx

```tsx
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

```

## Source

components/ui/avatar.tsx

```tsx
"use client";

import * as React from "react";
import { Avatar as ChakraAvatar } from "@chakra-ui/react";

import { Diamond } from "@/components/ui/diamond";
import { cn } from "@/lib/utils";

// Mireye's avatar is square: Mireye has no circles. A Fog tile with one Forest initial (pass it uppercase) in 13px
// medium, or the image filling the tile. Sizes: sm 24px, default 32px, lg 40px. The fallback shows until the image has
// loaded. `shape` is kept for compatibility and has no effect: every avatar is square.
function Avatar({ className, size = "default", shape: _shape, ...props }: React.ComponentProps<typeof ChakraAvatar.Root> & { size?: "sm" | "default" | "lg"; shape?: "square" | "circle" }) {
  return (
    <ChakraAvatar.Root
      unstyled
      data-slot="avatar"
      data-size={size}
      className={cn("group/avatar relative flex size-8 shrink-0 select-none data-[size=lg]:size-10 data-[size=sm]:size-6", className)}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof ChakraAvatar.Image>) {
  return <ChakraAvatar.Image unstyled data-slot="avatar-image" className={cn("aspect-square size-full object-cover", className)} {...props} />;
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof ChakraAvatar.Fallback>) {
  return (
    <ChakraAvatar.Fallback
      data-slot="avatar-fallback"
      className={cn("flex size-full items-center justify-center bg-subtle font-sans text-body leading-none font-medium text-fg group-data-[size=lg]/avatar:text-body-lg group-data-[size=sm]/avatar:text-caption", className)}
      {...props}
    />
  );
}

/**
 * A status node at the avatar's lower right (an agent at work, a reviewer online): a solid diamond in Fern on a white
 * square, so it reads on any image. Children are ignored; the node is the mark.
 */
function AvatarBadge({ className, children: _children, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="avatar-badge" className={cn("absolute -right-1 -bottom-1 z-10 flex size-3 items-center justify-center bg-surface text-success group-data-[size=lg]/avatar:size-3.5 group-data-[size=sm]/avatar:size-2.5", className)} {...props}>
      <Diamond size={12} />
    </span>
  );
}

/** Avatars side by side, 2px apart: squares do not overlap. */
function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="avatar-group" className={cn("group/avatar-group flex gap-0.5", className)} {...props} />;
}

/** The count of avatars not shown (+3): a white tile with the 1px Stone line. */
function AvatarGroupCount({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center border border-line bg-surface font-sans text-caption leading-none text-fg-secondary tabular-nums group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage };

```
