"use client";

import * as React from "react";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/ssr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, NumberCell, SiteCell, type DataTableColumn } from "@/components/ui/data-table";

type Site = { id: string; name: string; county: string; acres: number; kv: number | null; distance: number; zoning: string | null; status: "verified" | "queued" };

const COUNTIES = ["Ellis", "Navarro", "Kaufman", "Johnson", "Hill", "Henderson"];
const ZONING = ["I-2 Industrial", "Agricultural", null, "I-1 Light industrial", "Unzoned"];
const SITES: Site[] = Array.from({ length: 23 }, (_, i) => {
  const county = COUNTIES[i % COUNTIES.length];
  return {
    id: `0${42 + (i % 6)}-${117 + i}-${String((i * 7) % 100).padStart(2, "0")}`,
    name: `${county} County site ${i + 3}`,
    county,
    acres: 120 + ((i * 47) % 420) + (i % 10) / 10,
    kv: i % 7 === 4 ? null : [345, 138, 69][i % 3],
    distance: ((i * 13) % 90) / 10 + 0.4,
    zoning: ZONING[i % ZONING.length],
    status: i % 4 === 3 ? "queued" : "verified",
  };
});

const COLUMNS: DataTableColumn<Site>[] = [
  { id: "site", header: "Site", accessor: (s) => `${s.name} ${s.id}`, sortable: true, hideable: false, cell: (s) => <SiteCell name={s.name} parcelId={s.id} image={s.id.endsWith("0") ? undefined : "/examples/farmland-aerial.jpg"} /> },
  { id: "county", header: "County", accessor: (s) => s.county, sortable: true, cell: (s) => <span className="text-fg-secondary">{s.county}</span> },
  { id: "acres", header: "Acres", accessor: (s) => s.acres, sortable: true, align: "end", className: "text-right", cell: (s) => <NumberCell value={s.acres} /> },
  { id: "kv", header: "Nearest kV", accessor: (s) => s.kv, sortable: true, align: "end", className: "text-right", cell: (s) => <NumberCell value={s.kv} decimals={0} unit="kV" /> },
  { id: "distance", header: "Distance", accessor: (s) => s.distance, sortable: true, align: "end", className: "text-right", cell: (s) => <NumberCell value={s.distance} unit="mi" /> },
  { id: "zoning", header: "Zoning", accessor: (s) => s.zoning, hidden: true, cell: (s) => (s.zoning ? <Badge>{s.zoning}</Badge> : <span className="text-fg-subtle">Not recorded</span>) },
];

export function Preview() {
  return <DataTable columns={COLUMNS} data={SITES} getRowId={(s) => s.id} rowName="site" pageSize={5} filter={{ placeholder: "Filter sites" }} defaultSort={{ id: "acres", desc: true }} empty="No site matches." />;
}

export function Selection() {
  const [rows, setRows] = React.useState(SITES.slice(0, 8));
  const [selected, setSelected] = React.useState<string[]>([]);
  return (
    <DataTable
      columns={COLUMNS}
      data={rows}
      getRowId={(s) => s.id}
      rowName="site"
      selectable
      selection={selected}
      onSelectionChange={setSelected}
      pageSize={5}
      pageSizes={[5, 10, 20]}
      filter={{ placeholder: "Filter sites", columns: ["site", "county"] }}
      toolbar={
        <>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh"
            onClick={() => {
              setRows(SITES.slice(0, 8));
              setSelected([]);
            }}
          >
            <ArrowsClockwiseIcon />
          </Button>
          {selected.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setRows((r) => r.filter((s) => !selected.includes(s.id)));
                setSelected([]);
              }}
            >
              Remove {selected.length}
            </Button>
          )}
        </>
      }
    />
  );
}

export function Empty() {
  return <DataTable columns={COLUMNS} data={[]} getRowId={(s) => s.id} filter={false} hideViewOptions empty="No sites yet. Matching sites appear here once a search runs." />;
}
