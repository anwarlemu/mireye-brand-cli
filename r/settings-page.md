# Settings page
Settings in the app shell: a section list that stays in view, then workspace fields, members, API keys in DM Mono, notification switches and the destructive action alone in the last card.

Install: npx mireye-ds add settings-page
Requires: theme, app-shell, avatar, badge, button, card, field, input, native-select, switch, table, utils
Packages: @phosphor-icons/react
Exports: Member, ApiKey, SettingsPageProps, SettingsPage
Client boundary: yes
Reference: brand/reference product UI boards (Figma 442:2) and the library's product parts: field, input, switch, table, avatar (Figma UI · Inputs 442:79)


## Usage
Use for workspace or account settings. Pass `members`, `keys` and `onSave`. Keep Save changes the one Forest key; other actions are outlined or text.
- Avoid: Destructive actions beside ordinary ones
- Avoid: Keys shown in full
- Avoid: Toggles without labels


## Examples
Example components: npx mireye-ds add settings-page
[Preview](https://mireye-ds.agencidev.com/preview/settings-page/Preview)

examples/settings-page.tsx

```tsx
"use client";

import { SettingsPage } from "@/components/blocks/settings-page";

// Embedded at 900px; in an app the shell fills the viewport.
export function Preview() {
  return <SettingsPage className="h-225" />;
}

```

## Source

components/blocks/settings-page.tsx

```tsx
"use client";

import * as React from "react";
import { CopyIcon } from "@phosphor-icons/react/ssr";

import { AppShell, type AppShellProps } from "@/components/blocks/app-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Settings in the app shell: a list of the sections that stays in view on wide screens, then each section as a title
// and a line on the left with its card on the right: workspace fields, members, API keys in DM Mono, notification
// switches, and the destructive action alone in the last card. One Forest key, Save changes, in the header; every other
// action is outlined or a text action.

export type Member = { name: string; email: string; role: string; initials: string; you?: boolean };
export type ApiKey = { name: string; key: string; created: string; lastUsed: string };

const MEMBERS: Member[] = [
  { name: "You", email: "you@acme.com", role: "Owner", initials: "Y", you: true },
  { name: "Site team", email: "sites@acme.com", role: "Editor", initials: "S" },
  { name: "Analyst", email: "analyst@acme.com", role: "Viewer", initials: "A" },
];

const KEYS: ApiKey[] = [
  { name: "Production agent", key: "mk_live_••••••••3f9a", created: "Oct 2, 2026", lastUsed: "2 min ago" },
  { name: "Staging", key: "mk_test_••••••••c41e", created: "Sep 18, 2026", lastUsed: "Yesterday" },
];

const SECTIONS = [
  { id: "workspace", label: "Workspace" },
  { id: "members", label: "Members" },
  { id: "keys", label: "API keys" },
  { id: "notifications", label: "Notifications" },
  { id: "danger", label: "Delete workspace" },
];

const NAV_LINK =
  "flex h-8 items-center px-3 text-body leading-none text-fg-secondary outline-none transition-colors duration-150 ease-out hover:bg-subtle hover:text-fg focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-line-strong aria-[current=true]:bg-subtle-hover aria-[current=true]:text-fg motion-reduce:transition-none";

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="grid scroll-mt-6 gap-4 border-b border-line-subtle pb-8 last:border-b-0 lg:grid-cols-3 lg:gap-8">
      <div className="grid content-start gap-1">
        <h2 id={`${id}-title`} className="text-h3 leading-heading font-normal text-fg">
          {title}
        </h2>
        <p className="text-body leading-body text-fg-muted">{description}</p>
      </div>
      <div className="min-w-0 lg:col-span-2">{children}</div>
    </section>
  );
}

export type SettingsPageProps = Omit<AppShellProps, "title" | "children"> & {
  workspaceName?: string;
  members?: Member[];
  keys?: ApiKey[];
  onSave?: () => void;
};

export function SettingsPage({ workspaceName = "Acme Energy", members = MEMBERS, keys = KEYS, onSave, ...shell }: SettingsPageProps) {
  const [section, setSection] = React.useState(SECTIONS[0].id);
  return (
    <AppShell
      current="settings"
      title="Settings"
      actions={
        <Button size="sm" onClick={onSave}>
          Save changes
        </Button>
      }
      {...shell}
    >
      <div className="grid gap-8 p-4 sm:p-6 lg:grid-cols-5">
        <nav aria-label="Settings" className="max-lg:hidden lg:sticky lg:top-6 lg:self-start">
          <ul className="grid gap-0.5">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} aria-current={section === s.id} onClick={() => setSection(s.id)} className={NAV_LINK}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="grid min-w-0 gap-8 lg:col-span-4">
          <Section id="workspace" title="Workspace" description="The name your team and invoices see.">
            <Card>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="ws-name">Workspace name</FieldLabel>
                    <Input id="ws-name" defaultValue={workspaceName} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ws-units">Units</FieldLabel>
                    <NativeSelect id="ws-units" defaultValue="imperial">
                      <NativeSelectOption value="imperial">Acres, feet and miles</NativeSelectOption>
                      <NativeSelectOption value="metric">Hectares, meters and kilometers</NativeSelectOption>
                    </NativeSelect>
                    <FieldDescription>Used in answers, reports and exports.</FieldDescription>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          </Section>

          <Section id="members" title="Members" description="Who can see and edit searches in this workspace.">
            <Card>
              <CardContent className="overflow-x-auto fade-x">
                <Table className="min-w-120">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="sr-only">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m) => (
                      <TableRow key={m.email}>
                        <TableCell>
                          <span className="flex items-center gap-3">
                            <Avatar size="sm">
                              <AvatarFallback>{m.initials}</AvatarFallback>
                            </Avatar>
                            <span className="grid gap-0.5">
                              <span className="text-body text-fg">{m.name}</span>
                              <span className="font-mono text-caption text-fg-muted">{m.email}</span>
                            </span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={m.role === "Owner" ? "outline" : "default"}>{m.role}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{!m.you && <Button variant="ghost" size="sm">Remove</Button>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  Invite a member
                </Button>
              </CardFooter>
            </Card>
          </Section>

          <Section id="keys" title="API keys" description="Keys your agents use. Keep them secret; rotate one if it leaks.">
            <Card>
              <CardContent>
                <ul className="grid border-t border-line-subtle">
                  {keys.map((k) => (
                    <li key={k.key} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line-subtle py-3">
                      <span className="grid min-w-0 flex-1 gap-1">
                        <span className="text-body text-fg">{k.name}</span>
                        <span className="font-mono text-caption text-fg-muted">
                          {k.key} · created {k.created} · used {k.lastUsed}
                        </span>
                      </span>
                      <Button variant="ghost" size="icon-sm" aria-label={`Copy ${k.name} key`}>
                        <CopyIcon />
                      </Button>
                      <Button variant="outline" size="sm">
                        Rotate
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  Create a key
                </Button>
              </CardFooter>
            </Card>
          </Section>

          <Section id="notifications" title="Notifications" description="Email when something you care about changes.">
            <Card>
              <CardContent className="grid gap-4">
                {[
                  { label: "A search finishes", on: true },
                  { label: "A saved site changes", on: true },
                  { label: "Usage passes 80% of the plan", on: true },
                  { label: "Product news", on: false },
                ].map((n) => (
                  <Switch key={n.label} defaultChecked={n.on} className="w-full justify-between">
                    {n.label}
                  </Switch>
                ))}
              </CardContent>
            </Card>
          </Section>

          <Section id="danger" title="Delete workspace" description="Deletes every search, site and key. This cannot be undone.">
            <Card className={cn("[--ds-shape-stroke:var(--ds-color-status-danger)]")}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-body text-fg-secondary">{workspaceName} and everything in it.</p>
                <Button variant="destructive" size="sm">
                  Delete workspace
                </Button>
              </CardContent>
            </Card>
          </Section>
        </div>
      </div>
    </AppShell>
  );
}

```
