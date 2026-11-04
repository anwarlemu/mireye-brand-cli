---
name: map-controls
title: Map controls
type: product
surface: product
description: "Zoom in and zoom out: two square keys with the small cut, stacked in the map's bottom-right corner."
use_for: "Put `MapControls` in the bottom-right corner, its bottom on the scale bar's line. Pass `onZoomIn` and `onZoomOut`; disable one at the zoom limit. `MapControlButton` is one key for other map actions, with a 16px glyph and an `aria-label`."
never: ["Round keys or shadows", "Text labels in the keys", "The 20px plus here; map glyphs are 16px"]
source: "Figma \"UI · Map marker\" (443:395): 443:427 and 443:430"
files: ["components/ui/map-controls.tsx"]
---
