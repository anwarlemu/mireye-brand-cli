---
name: fit-score
title: Fit score
type: product
surface: product
description: "How well a site meets the buyer's requirements, 0 to 100: a tick bar, a chip or a ring, with the level in words."
use_for: "Use the bar in tables and Compare headers, the chip on cards and the ring on the parcel record. Pass `value` (null when never screened) and `loading` while a screen runs. Levels are words, never colors: Strong fit (80 and up), Moderate (60 to 79), Weak (under 60)."
never: ["Coloring the score by level", "A percent sign; it is a score", "A level without its word"]
source: "Not in Figma yet; built from Ticks, Tag and the Dial's geometry"
files: ["components/ui/fit-score.tsx"]
---
