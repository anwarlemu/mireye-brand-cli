---
name: map-scale
title: Map scale
type: product
surface: product
description: "The scale bar: a 1px ruler with ticks and the distance its whole length covers."
use_for: "Put it in the map's bottom-left corner. `label` is the true distance the bar covers at the map's center (\"640 ft\"); a new zoom level changes the label, never the bar. On imagery make it white with `text-fg-inverse`."
never: ["Alternating filled segments", "Resizing the bar", "A label that does not change with zoom"]
source: "Figma \"UI · Map marker\" (443:395): Scale 443:423"
files: ["components/ui/map-scale.tsx"]
---
