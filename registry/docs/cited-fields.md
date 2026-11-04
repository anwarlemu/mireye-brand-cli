---
name: cited-fields
title: Cited fields
type: product
surface: product
description: "The values an agent answer reports, each with its label and source chip, between Mist rules."
use_for: "Use under an answer to show the values it read (\"Flood zone, Zone X, 1\"). Each `CitedField` takes a label, its value as children and a source number; put them in `CitedFields`, and both under a `SourceGroup` with the `Sources` list so pointing links them."
never: ["Values without a source", "Fills on rows", "More than one value per row"]
source: "Figma \"UI · Agent chat\" (443:433): rows 443:471 to 443:487"
files: ["components/ui/cited-fields.tsx"]
---
