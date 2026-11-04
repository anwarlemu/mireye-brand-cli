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
