"use client";

import * as React from "react";
import { PlusIcon } from "@phosphor-icons/react/ssr";

import { AppShell, type AppShellProps } from "@/components/blocks/app-shell";
import { SurveyPlate, type PlateParcel } from "@/components/blocks/survey-plate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FitScore } from "@/components/ui/fit-score";
import { Progress } from "@/components/ui/progress";
import { Status, type StatusVariant } from "@/components/ui/status";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// The overview in the app shell: four figures (a muted label over the value in DM Mono, and the month's usage as a tick
// bar), the active search on a survey plate beside its shortlist (site, parcel ID in DM Mono and the fit chip), then
// the latest runs with their status pills. One Forest key, New search, in the header.

export type DashboardStat = { label: string; value: string; detail?: string };
export type ShortlistSite = { name: string; parcel: string; fit: number };
export type Run = { name: string; area: string; parcels: string; started: string; status: StatusVariant };

const STATS: DashboardStat[] = [
  { label: "Saved sites", value: "12", detail: "3 this week" },
  { label: "Parcels screened", value: "48,210", detail: "Ellis, Navarro, Kaufman" },
  { label: "Strong fits", value: "37", detail: "80 or higher" },
];

const SITES: ShortlistSite[] = [
  { name: "Ellis County site 14", parcel: "042-117-09", fit: 92 },
  { name: "Navarro County site 3", parcel: "175-020-41", fit: 84 },
  { name: "Kaufman County site 8", parcel: "129-334-02", fit: 71 },
  { name: "Ellis County site 22", parcel: "042-131-17", fit: 63 },
];

const RUNS: Run[] = [
  { name: "200+ ac near 138 kV", area: "Ellis County, TX", parcels: "18,402", started: "09:14", status: "processing" },
  { name: "Solar, outside floodplain", area: "Navarro County, TX", parcels: "11,930", started: "08:02", status: "verified" },
  { name: "Data center, 345 kV", area: "Kaufman County, TX", parcels: "17,878", started: "Yesterday", status: "verified" },
  { name: "Industrial, rail access", area: "Johnson County, TX", parcels: "Waiting", started: "Queued", status: "queued" },
];

const PARCELS: PlateParcel[] = [
  { x: 10, y: 16, w: 18, h: 24, state: "hatched", label: "042-131-17" },
  { x: 38, y: 42, w: 22, h: 30, state: "selected", label: "042-117-09" },
  { x: 66, y: 12, w: 20, h: 26, state: "hatched" },
  { x: 70, y: 56, w: 18, h: 28, state: "plain" },
  { x: 14, y: 60, w: 16, h: 22, state: "plain" },
];

export type DashboardPageProps = Omit<AppShellProps, "title" | "children"> & {
  title?: string;
  stats?: DashboardStat[];
  usage?: { used: number; included: number };
  sites?: ShortlistSite[];
  runs?: Run[];
};

export function DashboardPage({ title = "Overview", stats = STATS, usage = { used: 41280, included: 50000 }, sites = SITES, runs = RUNS, ...shell }: DashboardPageProps) {
  const [view, setView] = React.useState("map");
  return (
    <AppShell
      current="map"
      title={title}
      actions={
        <Button size="sm">
          <PlusIcon />
          New search
        </Button>
      }
      {...shell}
    >
      <div className="grid gap-6 p-4 sm:p-6">
        <section aria-label="Figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} size="sm">
              <CardHeader>
                <CardDescription>{s.label}</CardDescription>
                <p className="font-mono text-h1 leading-tight text-fg">{s.value}</p>
              </CardHeader>
              {s.detail && <CardContent className="text-caption text-fg-muted">{s.detail}</CardContent>}
            </Card>
          ))}
          <Card size="sm">
            <CardHeader>
              <CardDescription>Requests this month</CardDescription>
              <p className="font-mono text-h1 leading-tight text-fg">{usage.used.toLocaleString("en-US")}</p>
            </CardHeader>
            <CardContent>
              <Progress value={(usage.used / usage.included) * 100} aria-label={`${usage.used} of ${usage.included} requests`} />
              <p className="mt-2 font-mono text-caption text-fg-muted">of {usage.included.toLocaleString("en-US")}</p>
            </CardContent>
          </Card>
        </section>

        <section aria-label="Active search" className="grid gap-4 xl:grid-cols-3">
          <Card className="min-w-0 xl:col-span-2">
            <CardHeader>
              <CardTitle>200+ ac near 138 kV</CardTitle>
              <CardDescription>Ellis County, TX · 18,402 parcels</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Tabs value={view} onValueChange={setView}>
                <TabsList variant="segmented" aria-label="View">
                  <TabsTrigger value="map">Map</TabsTrigger>
                  <TabsTrigger value="terrain">Terrain</TabsTrigger>
                </TabsList>
              </Tabs>
              <SurveyPlate className="aspect-video w-full max-sm:aspect-4/3" parcels={PARCELS} contours={view === "terrain"} marker={{ x: 49, y: 57, value: "92 fit", coordinates: "32.4113, -96.8302" }} />
            </CardContent>
          </Card>
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Shortlist</CardTitle>
              <CardDescription>Best fits in this search</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid border-t border-line-subtle">
                {sites.map((s) => (
                  <li key={s.parcel} className="flex items-center gap-3 border-b border-line-subtle py-3">
                    <span className="grid min-w-0 flex-1 gap-1">
                      <span className="truncate text-body text-fg">{s.name}</span>
                      <span className="font-mono text-caption text-fg-muted">{s.parcel}</span>
                    </span>
                    <FitScore variant="chip" value={s.fit} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section aria-label="Latest runs">
          <Card>
            <CardHeader>
              <CardTitle>Latest runs</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table className="min-w-140">
                <TableHeader>
                  <TableRow>
                    <TableHead>Search</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead className="text-right">Parcels</TableHead>
                    <TableHead className="text-right">Started</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((r) => (
                    <TableRow key={r.name}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell className="text-fg-secondary">{r.area}</TableCell>
                      <TableCell className="text-right font-mono text-caption">{r.parcels}</TableCell>
                      <TableCell className="text-right font-mono text-caption">{r.started}</TableCell>
                      <TableCell>
                        <Status variant={r.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
