"use client";

import * as React from "react";
import {
  ChatTextIcon,
  DropIcon,
  FileTextIcon,
  FolderSimpleIcon,
  GearSixIcon,
  LightningIcon,
  MapTrifoldIcon,
  MountainsIcon,
  PlusIcon,
  QuestionIcon,
  SidebarSimpleIcon,
  StackIcon,
} from "@phosphor-icons/react/ssr";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

type Row = { title: string; icon: React.ComponentType<{ className?: string }>; mark?: string; count?: number };

const TOP: Row[] = [
  { title: "Ask", icon: ChatTextIcon },
  { title: "Map", icon: MapTrifoldIcon },
  { title: "Saved sites", icon: StackIcon, count: 12 },
  { title: "Reports", icon: FileTextIcon },
];
const LAYERS: Row[] = [
  { title: "Power", icon: LightningIcon },
  { title: "Water", icon: DropIcon },
  { title: "Terrain", icon: MountainsIcon, mark: "New" },
];

function Rows({ rows, current, onSelect }: { rows: Row[]; current: string; onSelect: (title: string) => void }) {
  return (
    <SidebarMenu>
      {rows.map(({ title, icon: Icon, mark, count }) => (
        <SidebarMenuItem key={title}>
          <SidebarMenuButton isActive={current === title} tooltip={title} onClick={() => onSelect(title)}>
            <Icon />
            <span>{title}</span>
          </SidebarMenuButton>
          {count ? <SidebarMenuBadge variant="count">{count}</SidebarMenuBadge> : null}
          {mark ? <SidebarMenuBadge>{mark}</SidebarMenuBadge> : null}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function Lockup() {
  return (
    <div className="flex h-6 items-center gap-2 px-1 text-fg">
      <svg viewBox="0 0 27.1667 20" aria-hidden fill="currentColor" className="h-4 w-auto shrink-0">
        <path d="M8.84329 0C11.3929 0 13.9424 0 16.4921 0C16.4903 3.21956 16.4921 6.43914 16.4972 9.65868C17.6796 8.31596 18.8583 6.97033 20.0332 5.6217C22.3433 5.61668 24.6536 5.61498 26.9637 5.61668C26.9654 8.98668 26.9637 12.3567 26.9586 15.7267C25.766 17.0794 24.5773 18.4351 23.3922 19.7937C21.0821 19.7988 18.7719 19.8005 16.4617 19.7988C16.4634 16.4489 16.4617 13.0989 16.4567 9.74898C13.5245 13.1 10.5887 16.4483 7.64944 19.7937C5.09983 19.7988 2.55023 19.8005 0.000633646 19.7988C-0.00105569 16.5625 0.000633646 13.3263 0.00569231 10.09C2.95368 6.72789 5.89955 3.36461 8.84329 0Z" />
      </svg>
      <span className="text-body-lg leading-none group-data-[collapsible=icon]/sidebar:hidden">Mireye</span>
    </div>
  );
}

function CollapseRow() {
  const { toggleSidebar, state } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip="Expand" onClick={toggleSidebar} aria-expanded={state === "expanded"}>
        <SidebarSimpleIcon />
        <span>{state === "expanded" ? "Collapse" : "Expand"}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function AppRail({ collapsible = "offcanvas" }: { collapsible?: "offcanvas" | "icon" | "none" }) {
  const [current, setCurrent] = React.useState("Map");
  return (
    <Sidebar collapsible={collapsible}>
      <SidebarHeader className="px-4">
        <Lockup />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Rows rows={TOP} current={current} onSelect={setCurrent} />
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Layers</SidebarGroupLabel>
          <SidebarGroupContent>
            <Rows rows={LAYERS} current={current} onSelect={setCurrent} />
          </SidebarGroupContent>
        </SidebarGroup>
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
            <SidebarMenuButton tooltip="Acme Energy">
              <Avatar size="sm" className="data-[size=sm]:size-4">
                <AvatarFallback className="text-micro">A</AvatarFallback>
              </Avatar>
              <span>Acme Energy</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {collapsible === "icon" && <CollapseRow />}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

/** A page head beside the rail: a 24px regular title, the muted line under it, actions at the right, a Stone rule below. */
function PageHead({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) {
  return (
    <header className="mx-6 mt-5 mb-4 flex items-start gap-3 border-b border-line pb-4">
      <SidebarTrigger className="-ml-2 md:hidden" />
      <div className="min-w-0 flex-1">
        <h1 className="text-h1 leading-heading font-normal text-fg">{title}</h1>
        <p className="mt-1 text-body text-fg-muted">{description}</p>
      </div>
      {actions && <div className="ml-auto flex shrink-0 items-center gap-3">{actions}</div>}
    </header>
  );
}

export function Preview() {
  return (
    <SidebarProvider className="h-140 min-h-0 overflow-hidden border border-line">
      <AppRail />
      <SidebarInset className="bg-page">
        <PageHead
          title="Map"
          description="Sites within 25 mi of Waxahachie, TX."
          actions={
            <Button>
              New search
              <ArrowRightIcon size={16} aria-hidden />
            </Button>
          }
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

export function Icons() {
  return (
    <SidebarProvider defaultOpen={false} className="h-140 min-h-0 overflow-hidden border border-line">
      <AppRail collapsible="icon" />
      <SidebarInset className="bg-page">
        <PageHead title="Saved sites" description="Press Cmd B, or Collapse, to switch between the full rail and its glyphs." />
      </SidebarInset>
    </SidebarProvider>
  );
}

const PROJECTS: { label: string; action?: boolean; rows: Row[] }[] = [
  { label: "Searches", action: true, rows: [{ title: "200+ ac near 138 kV", icon: FolderSimpleIcon, count: 14 }, { title: "Solar, Navarro County", icon: FolderSimpleIcon, count: 6 }] },
  { label: "Shortlist", rows: [{ title: "Ellis County site 14", icon: StackIcon }, { title: "Kaufman County site 8", icon: StackIcon }] },
  { label: "Settings", rows: [{ title: "Team", icon: GearSixIcon }] },
];

export function SecondRail() {
  const [current, setCurrent] = React.useState("200+ ac near 138 kV");
  return (
    <SidebarProvider className="h-140 min-h-0 overflow-hidden border border-line">
      <Sidebar variant="secondary" collapsible="none">
        <SidebarHeader>
          <p className="flex items-center gap-2 px-3 text-body text-fg">
            Acme Energy <Badge size="sm">API</Badge>
          </p>
        </SidebarHeader>
        <SidebarContent>
          {PROJECTS.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              {group.action && (
                <SidebarGroupAction aria-label={`New ${group.label.toLowerCase()}`}>
                  <PlusIcon />
                </SidebarGroupAction>
              )}
              <SidebarGroupContent>
                <Rows rows={group.rows} current={current} onSelect={setCurrent} />
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <PageHead title="200+ ac near 138 kV" description="14 sites in Ellis, Navarro and Kaufman counties." />
      </SidebarInset>
    </SidebarProvider>
  );
}

export function Loading() {
  return (
    <SidebarProvider className="h-100 min-h-0 overflow-hidden border border-line">
      <Sidebar collapsible="none">
        <SidebarHeader className="px-4">
          <Lockup />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Layers</SidebarGroupLabel>
            <SidebarMenu>
              {Array.from({ length: 5 }, (_, i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-page">
        <PageHead title="Layers" description="Loading the layers for Texas" />
      </SidebarInset>
    </SidebarProvider>
  );
}
