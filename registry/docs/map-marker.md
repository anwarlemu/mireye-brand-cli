---
name: map-marker
title: Map marker
type: product
surface: product
description: "A survey point: two pairs of survey lines across the map, four nodes and a Forest tag with the reading."
use_for: "Put `MapMarker` inside the map viewport with `x`, `y`, `value` and `coordinates`. Leave out the reading to show only lines and nodes. `variant=\"crosshair\"` draws one crosshair with a framed node and the one-row tag beside it; `side=\"left\"` near the right edge. `MapTag` is the tag alone."
never: ["More than one marker with a tag at once", "Moving the offsets; only the point moves"]
source: "Figma \"UI · Map marker\" (443:395): 443:406 to 443:420"
files: ["components/ui/map-marker.tsx"]
---
