---
name: data-table
title: Data Table
type: ui
surface: site
description: "The site list: a filter field and a Columns menu over Mireye's ruled table, sortable heads with Mireye's arrow head, row checkboxes, site cells with an aerial and a DM Mono parcel ID, and the pager."
use_for: "Use for a list of records people sort, filter, select and page through (sites for a buy box, parcels in a county, saved searches): pass columns (id, header, an accessor for sorting and filtering, a cell), data and getRowId. Lead with SiteCell, align numbers right with NumberCell (one decimal, a unit) and write Not recorded for a missing value. Turn on selectable for bulk actions and put them in toolbar; set pageSize and pageSizes for long lists. For a short fixed list, use Table."
never: [Zebra stripes, A filled head, A frame around the table and the toolbar together, Animating rows when sorting or paging, Selection shown only by a row tint, Empty cells where a value is missing]
source: "LAND data-table (the Leads sites table: header rule, Mist rows, SiteCell, NumberCell) and cited-fields (443:433)"
---
