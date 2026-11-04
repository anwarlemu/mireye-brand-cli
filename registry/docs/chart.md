---
name: chart
title: Chart
type: ui
surface: site
description: "SVG bar, line, area and pie charts in the survey-sheet look: 1px lines, square bars, diamond points, flat fills in the chart series colors, a solid Mist grid, lines that draw in from the left like a plotter, and a cut-frame tooltip."
use_for: "Use for a measure across a few categories or along a distance or time (sites per county, elevation along a parcel, interconnection requests per year). Wrap the chart in ChartContainer with a config naming each series; colors default to the series tokens in order. Add ChartTooltip with ChartTooltipContent and ChartLegend with ChartLegendContent. Use a pie only for shares of one whole with three or four parts (land use)."
never: [Gradients or glows, Lines thicker than 1px, Rounded bars, Colors outside the series tokens, 3D or shadowed charts, More than five series]
source: "LAND fit-score and compare-matrix (tick and line look) and the ds-draw motion; chart series tokens from the palette (331:37)"
---
