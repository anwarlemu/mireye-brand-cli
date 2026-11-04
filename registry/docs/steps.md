---
name: steps
title: Steps
type: product
surface: product
description: "Survey nodes joined by a line: the stages of a run, done, current and pending."
use_for: "Use for a fixed sequence of stages (\"Parcel, Power, Water, Report\"). Pass the labels and `current`, the stage in progress; `steps.length` means all done. Labels reach half their width past the row's ends, so leave room, or use `labelAlign=\"edges\"`. When `current` moves on, the finished node stamps, the line travels and the next node lights on arrival."
never: ["Numbered circles", "More than six stages", "Clickable steps; this shows progress, not navigation"]
source: "Figma \"UI · Progress\" (442:213), row \"Steps\""
files: ["components/ui/steps.tsx"]
---
