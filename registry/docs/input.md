---
name: input
title: Input
type: ui
surface: site
description: "Mireye's field: 36px, white inside a 1px Stone line with the 8px cut corner, 13px Forest text and a Slate placeholder 16px in. Focus turns the line Forest (no ring); invalid turns it brick; read-only is Fog, disabled Mist. `unit` puts a unit after the value (ac, kV) or a Unit Select."
use_for: "Use for one line of text or a number: a site name, a parcel number, a size. Put a Label 8px above it (or use Field). Pass `unit` when the value has one, and a Unit Select when the reader can change it. Set aria-invalid when the value is rejected and say why below it. For search, use Input Group with the parcel glyph."
never: ["A placeholder as the only label", "Rounded corners or a shadow", "A focus ring around the field (the line turns Forest instead)", "A hover effect on the field", "A unit typed into the value"]
source: "Figma \"UI · Inputs\" (442:107): Default, Focused, Filled and Search rows"
---
