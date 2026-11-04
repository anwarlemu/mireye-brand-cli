---
name: map
title: Map
type: product
surface: product
description: "The overlays on Mireye's map in one module: the survey marker and its tag, the scale bar and the zoom controls."
use_for: "Draw these on top of the product's map. On imagery, dim the photo with `ds-imagery`, use `tone=\"photo\"` on the marker and a white scale. MapMarker fills its viewport; `x` and `y` are the point in viewport pixels. The example draws on live USGS orthoimagery and keeps its Forest ground offline."
never: ["Pins, drop shadows or round markers", "Colored survey lines", "A bright photo under the marks"]
source: "Figma \"UI · Map marker\" (443:395) and the map exploration (449:2)"
files: ["components/ui/map.tsx"]
---
