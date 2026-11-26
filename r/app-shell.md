# App shell
The app's frame: the 212px Bone rail (lockup, rows, labelled groups, Help and the workspace), a 56px header with breadcrumb, title, mono meta and actions over a Stone rule, and a scrolling content slot.

Install: npx mireye-ds add app-shell
Requires: theme, avatar, breadcrumb, mireye-mark, sidebar, utils
Packages: @phosphor-icons/react
Exports: ShellNavItem, ShellNavGroup, AppShellProps, AppShell
Client boundary: yes
Reference: brand/reference product UI boards (Figma 442:2) and the library's product parts: sidebar, breadcrumb


## Usage
Use as the base of every product screen. Pass `nav` groups, the `current` row id, `title`, `breadcrumb`, `meta` and `actions` (one Forest key at most), and the screen as children. It fills the viewport; give it a height class to embed it. Below 768px the rail opens as a sheet.
- Avoid: A rail wider than 212px
- Avoid: Two Forest keys in the header
- Avoid: Icons that move on hover
- Avoid: Shadows under the header


## Examples
Example components: npx mireye-ds add app-shell button empty
[Preview](https://mireye-ds.agencidev.com/preview/app-shell/Preview)

examples/app-shell.tsx

```tsx
"use client";

import { AppShell } from "@/components/blocks/app-shell";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

// Embedded at 800px; in an app the shell fills the viewport.
export function Preview() {
  return (
    <AppShell
      className="h-200"
      current="reports"
      breadcrumb={["Workspace"]}
      title="Reports"
      meta="0 reports"
      actions={<Button size="sm">New report</Button>}
    >
      <div className="grid h-full place-items-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No reports yet</EmptyTitle>
            <EmptyDescription>Open a saved site and choose Open report to write one.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </AppShell>
  );
}

```

## Source

components/blocks/app-shell.tsx

```tsx
"use client";

import * as React from "react";
import { ChatTextIcon, FileTextIcon, GearSixIcon, MapTrifoldIcon, QuestionIcon, StackIcon } from "@phosphor-icons/react/ssr";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { MireyeMark } from "@/components/ui/mireye-mark";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// The app's frame, the base the other shells use: the 212px Bone rail (the lockup, the main rows, labelled groups,
// Help and the workspace at the foot), a 56px header with the breadcrumb, the page title and its actions over a 1px
// Stone rule, and the content slot, which scrolls on its own. Below 768px the rail opens as a sheet from the menu key.
// Rows fill Fog under the pointer and Mist when current (the sidebar's own 150ms color step); nothing moves.

export type ShellNavItem = { id: string; label: string; icon?: React.ComponentType<{ className?: string }>; count?: number; mark?: string };
export type ShellNavGroup = { label?: string; items: ShellNavItem[] };

const NAV: ShellNavGroup[] = [
  {
    items: [
      { id: "ask", label: "Ask", icon: ChatTextIcon },
      { id: "map", label: "Map", icon: MapTrifoldIcon },
      { id: "sites", label: "Saved sites", icon: StackIcon, count: 12 },
      { id: "reports", label: "Reports", icon: FileTextIcon },
    ],
  },
  { label: "Workspace", items: [{ id: "settings", label: "Settings", icon: GearSixIcon }] },
];

export type AppShellProps = {
  nav?: ShellNavGroup[];
  /** The id of the current row. */
  current?: string;
  onNavigate?: (id: string) => void;
  /** Breadcrumb trail before the title, e.g. ["Saved sites"]. */
  breadcrumb?: string[];
  title: React.ReactNode;
  /** Mono text after the title, e.g. a count or an ID. */
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  workspace?: string;
  name?: string;
  /** Classes for the frame. It fills the viewport by default; give it a height to embed it. */
  className?: string;
  /** Classes for the scrolling content area. */
  contentClassName?: string;
  children?: React.ReactNode;
};

export function AppShell({ nav = NAV, current, onNavigate, breadcrumb, title, meta, actions, workspace = "Acme Energy", name = "Mireye", className, contentClassName, children }: AppShellProps) {
  const [active, setActive] = React.useState(current ?? nav[0]?.items[0]?.id);
  React.useEffect(() => {
    if (current) setActive(current);
  }, [current]);
  const select = (id: string) => {
    setActive(id);
    onNavigate?.(id);
  };
  return (
    <SidebarProvider data-slot="app-shell" className={cn("h-dvh min-h-0 overflow-hidden bg-page font-sans text-fg", className)}>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="px-4">
          <div className="flex h-6 items-center gap-2 px-1 text-fg">
            <MireyeMark aria-hidden role="presentation" className="h-4 w-5.5" />
            <span className="text-body-lg leading-none">{name}</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {nav.map((group, gi) => (
            <SidebarGroup key={group.label ?? gi}>
              {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map(({ id, label, icon: Icon, count, mark }) => (
                    <SidebarMenuItem key={id}>
                      <SidebarMenuButton isActive={active === id} tooltip={label} onClick={() => select(id)}>
                        {Icon && <Icon />}
                        <span>{label}</span>
                      </SidebarMenuButton>
                      {count ? <SidebarMenuBadge variant="count">{count}</SidebarMenuBadge> : null}
                      {mark ? <SidebarMenuBadge>{mark}</SidebarMenuBadge> : null}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Help">
                <QuestionIcon />
                <span>Help</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={workspace}>
                <Avatar size="sm" className="data-[size=sm]:size-4">
                  <AvatarFallback className="text-micro">{workspace.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{workspace}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-h-0 min-w-0 bg-page">
        <header className="flex min-h-14 shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-2.5 sm:px-6">
          <SidebarTrigger className="-ml-2 md:hidden" />
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {breadcrumb?.length ? (
              <Breadcrumb className="min-w-0">
                <BreadcrumbList className="flex-nowrap">
                  {breadcrumb.map((b) => (
                    <React.Fragment key={b}>
                      <BreadcrumbItem className="max-sm:hidden">
                        <BreadcrumbLink href="#">{b}</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="max-sm:hidden" />
                    </React.Fragment>
                  ))}
                  <BreadcrumbItem className="min-w-0">
                    <BreadcrumbPage className="truncate text-body-lg">{title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            ) : (
              <h1 className="truncate text-body-lg leading-tight font-normal text-fg">{title}</h1>
            )}
            {meta != null && <span className="shrink-0 font-mono text-caption text-fg-muted max-sm:hidden">{meta}</span>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
        <div data-slot="app-shell-content" className={cn("min-h-0 flex-1 overflow-y-auto fade-y", contentClassName)}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

```
