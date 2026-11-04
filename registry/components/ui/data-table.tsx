"use client";

import * as React from "react";
import { ColumnsIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { ParcelIcon } from "@/components/icons/parcel-icon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

// A list of records people sort, filter, select and page through (the Leads sites table), on Mireye's Table: no frame
// of its own, a head of 12px labels in Forest at 80% over a 1px Stone rule, 44px rows ruled in Mist, a selected row on
// Fog. A sortable head is a button; its arrow (Mireye's arrow head) shows only once the column is sorted or under the
// pointer, and turns (150ms) when the sort reverses, so the label never moves. Above it, a toolbar: a filter field
// with a magnifying glass and the outline Columns key that opens a menu of checkboxes. Under it, the pager: the
// selection count and rows per page at the left, the page and its arrow keys at the right. Sorting, filtering and
// paging are instant (no motion): they are repeated many times in a row. Put it on the canvas or in a cut-frame card.
// SiteCell, NumberCell and TextCell are the cells the site lists use.

type Value = string | number | Date | boolean | null | undefined;

type DataTableColumn<T> = {
  id: string;
  /** The column's label, in its head and in the Columns menu. */
  header: React.ReactNode;
  /** What the cell shows; defaults to the accessor's value. */
  cell?: (row: T) => React.ReactNode;
  /** The value used to sort and filter. */
  accessor?: (row: T) => Value;
  sortable?: boolean;
  /** Whether the Columns menu can hide it (default true). */
  hideable?: boolean;
  /** Hidden until turned on in the Columns menu. */
  hidden?: boolean;
  align?: "start" | "end";
  className?: string;
};

type SortState = { id: string; desc: boolean } | null;

const text = (v: Value) => (v instanceof Date ? v.toISOString() : v == null ? "" : String(v));
function compare(a: Value, b: Value) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  return text(a).localeCompare(text(b), undefined, { numeric: true, sensitivity: "base" });
}

/** A sortable head label: a button whose arrow head shows the direction once sorted. */
function DataTableColumnHeader({ title, sorted, onSort, className }: { title: React.ReactNode; sorted: false | "asc" | "desc"; onSort?: () => void; className?: string }) {
  if (!onSort) return <span className={className}>{title}</span>;
  return (
    <button
      type="button"
      data-slot="data-table-column-header"
      onClick={onSort}
      className={cn(
        "group/sort inline-flex h-7 cursor-pointer items-center gap-1.5 font-sans text-caption leading-tight font-normal text-fg-secondary outline-none transition-colors duration-fast ease-out hover:text-fg focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong data-[sorted=true]:text-fg motion-reduce:transition-none in-[th.text-right]:flex-row-reverse",
        className,
      )}
      data-sorted={!!sorted}
    >
      {title}
      <ArrowRightIcon
        size={16}
        head
        aria-hidden
        className={cn(
          "size-3 transition-[rotate,opacity] duration-fast ease-out motion-reduce:transition-none",
          sorted ? "opacity-100" : "opacity-0 group-hover/sort:opacity-60 group-focus-visible/sort:opacity-60",
          sorted === "desc" ? "rotate-90" : "-rotate-90",
        )}
      />
    </button>
  );
}

/** The Columns key and its menu of checkboxes, one per column that can be hidden. */
function DataTableViewOptions({ columns, visible, onVisibleChange }: { columns: { id: string; header: React.ReactNode }[]; visible: Record<string, boolean>; onVisibleChange: (id: string, on: boolean) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="shrink-0">
          <ColumnsIcon />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Show columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((c) => (
          <DropdownMenuCheckboxItem key={c.id} checked={visible[c.id] !== false} onCheckedChange={(on) => onVisibleChange(c.id, on === true)} onSelect={(e) => e.preventDefault()}>
            {c.header}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** The pager under the table: the selection count and rows per page at the left; "Page 2 of 5" and two ghost keys
 * with Mireye's arrow at the right, in a row at least 44px tall. */
function DataTablePagination({ page, pageCount, onPageChange, pageSize, pageSizes, onPageSizeChange, selected, total, className }: { page: number; pageCount: number; onPageChange: (page: number) => void; pageSize?: number; pageSizes?: number[]; onPageSizeChange?: (size: number) => void; selected?: number; total?: number; className?: string }) {
  const go = (p: number) => () => {
    if (p >= 0 && p < pageCount) onPageChange(p);
  };
  return (
    <nav aria-label="Pagination" data-slot="data-table-pagination" className={cn("flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1", className)}>
      <div className="flex min-h-7 flex-wrap items-center gap-x-4 gap-y-1 text-caption leading-tight text-fg-muted">
        {selected !== undefined && total !== undefined && (
          <span aria-live="polite">
            {selected} of {total} selected
          </span>
        )}
        {pageSizes && pageSize && onPageSizeChange && (
          <span className="flex items-center gap-2">
            <span id="data-table-page-size">Rows per page</span>
            <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
              <SelectTrigger size="sm" aria-labelledby="data-table-page-size" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizes.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </span>
        )}
      </div>
      <div className="ml-auto flex items-center gap-1">
        <span aria-current="page" className="mr-2 text-caption leading-tight text-fg-muted tabular-nums">
          Page {page + 1} of {pageCount}
        </span>
        <Button variant="ghost" size="icon-sm" aria-label="Previous page" onClick={go(page - 1)} disabled={page === 0}>
          <ArrowRightIcon size={16} className="rotate-180" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Next page" onClick={go(page + 1)} disabled={page >= pageCount - 1}>
          <ArrowRightIcon size={16} />
        </Button>
      </div>
    </nav>
  );
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  /** A filter field over these columns' values (all filterable columns when omitted). */
  filter?: { placeholder?: string; columns?: string[] } | false;
  /** A checkbox column for choosing rows. */
  selectable?: boolean;
  selection?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Hide the Columns key. */
  hideViewOptions?: boolean;
  pageSize?: number;
  /** Offer these page sizes in the bar. */
  pageSizes?: number[];
  defaultSort?: SortState;
  /** Shown in the body when nothing matches. */
  empty?: React.ReactNode;
  /** Actions at the toolbar's right, before the Columns key. */
  toolbar?: React.ReactNode;
  /** What a row is called in labels ("site"). */
  rowName?: string;
  /** The plain ruled table (default), or the same inside the white cut frame. */
  variant?: "default" | "framed" | "open";
  className?: string;
};

function DataTable<T>({ columns, data, getRowId, filter = {}, selectable = false, selection: selectionProp, onSelectionChange, hideViewOptions = false, pageSize: pageSizeProp = 10, pageSizes, defaultSort = null, empty = "No results.", toolbar, rowName = "row", variant = "default", className }: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortState>(defaultSort);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(pageSizeProp);
  const [visible, setVisible] = React.useState<Record<string, boolean>>(() => Object.fromEntries(columns.map((c) => [c.id, !c.hidden])));
  const [selectionInner, setSelectionInner] = React.useState<string[]>([]);
  const selection = selectionProp ?? selectionInner;
  const setSelection = (ids: string[]) => {
    if (!selectionProp) setSelectionInner(ids);
    onSelectionChange?.(ids);
  };

  const shown = columns.filter((c) => visible[c.id] !== false);
  const filterColumns = filter ? columns.filter((c) => c.accessor && (!filter.columns || filter.columns.includes(c.id))) : [];

  const q = query.trim().toLowerCase();
  let rows = q ? data.filter((row) => filterColumns.some((c) => text(c.accessor!(row)).toLowerCase().includes(q))) : data;
  const sortColumn = sort && columns.find((c) => c.id === sort.id);
  if (sort && sortColumn?.accessor) {
    const get = sortColumn.accessor;
    rows = [...rows].sort((a, b) => compare(get(a), get(b)) * (sort.desc ? -1 : 1));
  }

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const pageRows = rows.slice(current * pageSize, current * pageSize + pageSize);
  const pageIds = pageRows.map(getRowId);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selection.includes(id));
  const someOnPage = pageIds.some((id) => selection.includes(id));

  const toggleSort = (id: string) => setSort((s) => (s?.id !== id ? { id, desc: false } : s.desc ? null : { id, desc: true }));

  return (
    <div data-slot="data-table" className={cn("grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3", className)}>
      {(filter || !hideViewOptions || toolbar) && (
        <div data-slot="data-table-toolbar" className="flex flex-wrap items-center gap-2">
          {filter && (
            <InputGroup className="max-w-72 min-w-48 flex-1">
              <InputGroupAddon>
                <MagnifyingGlassIcon className="size-4 text-fg-subtle" />
              </InputGroupAddon>
              <InputGroupInput
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder={filter.placeholder ?? "Filter"}
                aria-label={filter.placeholder ?? "Filter"}
              />
            </InputGroup>
          )}
          <div className="ml-auto flex items-center gap-2">
            {toolbar}
            {!hideViewOptions && (
              <DataTableViewOptions
                columns={columns.filter((c) => c.hideable !== false)}
                visible={visible}
                onVisibleChange={(id, on) => setVisible((v) => ({ ...v, [id]: on }))}
              />
            )}
          </div>
        </div>
      )}
      <div>
        <Table variant={variant}>
          <TableHeader>
            <TableRow data-empty="">
              {selectable && (
                <TableHead>
                  <Checkbox
                    aria-label={`Select every ${rowName} on this page`}
                    checked={allOnPage ? true : someOnPage ? "indeterminate" : false}
                    onCheckedChange={(on) => setSelection(on === true ? [...new Set([...selection, ...pageIds])] : selection.filter((id) => !pageIds.includes(id)))}
                  />
                </TableHead>
              )}
              {shown.map((c) => (
                <TableHead key={c.id} aria-sort={sort?.id === c.id ? (sort.desc ? "descending" : "ascending") : c.sortable ? "none" : undefined} className={cn(c.align === "end" && "text-right", c.className)}>
                  <DataTableColumnHeader title={c.header} sorted={sort?.id === c.id ? (sort.desc ? "desc" : "asc") : false} onSort={c.sortable && c.accessor ? () => toggleSort(c.id) : undefined} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length ? (
              pageRows.map((row) => {
                const id = getRowId(row);
                const selected = selection.includes(id);
                return (
                  <TableRow key={id} data-state={selected ? "selected" : undefined}>
                    {selectable && (
                      <TableCell>
                        <Checkbox aria-label={`Select ${rowName} ${id}`} checked={selected} onCheckedChange={(on) => setSelection(on === true ? [...selection, id] : selection.filter((s) => s !== id))} />
                      </TableCell>
                    )}
                    {shown.map((c) => (
                      <TableCell key={c.id} className={cn(c.align === "end" && "text-right", c.className)}>
                        {c.cell ? c.cell(row) : text(c.accessor?.(row))}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow data-empty="">
                <TableCell colSpan={shown.length + (selectable ? 1 : 0)} className="h-auto px-6 py-12 text-center whitespace-normal text-fg-muted">
                  {empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <DataTablePagination
          className="mt-1"
          page={current}
          pageCount={pageCount}
          onPageChange={setPage}
          pageSize={pageSize}
          pageSizes={pageSizes}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(0);
          }}
          selected={selectable ? selection.length : undefined}
          total={selectable ? data.length : undefined}
        />
      </div>
    </div>
  );
}

/**
 * A site's lead cell: an aerial crop (48 by 36px, the parcel outlined in Bone on it) or the parcel glyph on Fog, then
 * the name and the parcel ID in DM Mono. The ID truncates from its start: IDs share their beginning, so the end is the
 * part that differs.
 */
function SiteCell({ name, parcelId, image }: { name: string; parcelId?: string; image?: string }) {
  return (
    <span data-slot="data-table-site" className="flex min-w-0 items-center gap-3">
      <span aria-hidden className="relative flex h-9 w-12 shrink-0 items-center justify-center overflow-hidden bg-subtle text-fg-subtle">
        {image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="ds-imagery size-full object-cover" />
            <span className="absolute inset-x-[28%] inset-y-[26%] border border-bone" />
          </>
        ) : (
          <ParcelIcon />
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-body text-fg" title={name}>
          {name}
        </span>
        {parcelId && (
          <span dir="rtl" className="truncate text-left font-mono text-caption leading-tight text-fg-muted" title={parcelId}>
            <bdi>{parcelId}</bdi>
          </span>
        )}
      </span>
    </span>
  );
}

/** A number cell: tabular figures, one decimal by default, an optional unit; no value reads "Not recorded" in Slate. */
function NumberCell({ value, decimals = 1, unit }: { value: number | null | undefined; decimals?: number; unit?: string }) {
  if (value == null) return <span className="text-fg-subtle">Not recorded</span>;
  return (
    <span className="tabular-nums">
      {value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {unit ? ` ${unit}` : ""}
    </span>
  );
}

/** A text cell: one line, truncated, with the full text on hover; no value reads "Not recorded" in Slate. */
function TextCell({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-fg-subtle">Not recorded</span>;
  return (
    <span className="block max-w-60 truncate" title={value}>
      {value}
    </span>
  );
}

export { DataTable, DataTableColumnHeader, DataTablePagination, DataTableViewOptions, NumberCell, SiteCell, TextCell };
export type { DataTableColumn, DataTableProps, SortState };
