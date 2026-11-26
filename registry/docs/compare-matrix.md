---
name: compare-matrix
title: Compare matrix
type: product
surface: product
description: "Two to four sites side by side against the same requirements, with fit, notes and a tally."
use_for: "Use to compare finalists. Pass `sites`, `requirements` (with each site's result), optional `notes` and `market`. A failing Must cell fills Fog with a Forest bar; `activeRequirement` steps the other rows back. `onAddSite` and `onRemoveSite` add and remove columns; columns that stay glide. On narrow screens the table scrolls in its own region with the requirement column pinned. On a narrow screen the end edge fades (fade-x-end) and cells fade under the pinned column (fade-under) as they scroll."
never: ["More than four sites", "Colored pass and fail cells", "Reordering requirements by result"]
source: "Not in Figma yet; built from the product survey of the Compare screen"
files: ["components/ui/compare-matrix.tsx"]
---
