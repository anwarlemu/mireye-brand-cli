---
name: app-shell
title: App shell
type: block
group: shells
surface: site
description: "The app's frame: the 212px Bone rail (lockup, rows, labelled groups, Help and the workspace), a 56px header with breadcrumb, title, mono meta and actions over a Stone rule, and a scrolling content slot."
use_for: "Use as the base of every product screen. Pass `nav` groups, the `current` row id, `title`, `breadcrumb`, `meta` and `actions` (one Forest key at most), and the screen as children. It fills the viewport; give it a height class to embed it. Below 768px the rail opens as a sheet."
never: ["A rail wider than 212px", "Two Forest keys in the header", "Icons that move on hover", "Shadows under the header"]
source: "brand/reference product UI boards (Figma 442:2) and the library's product parts: sidebar, breadcrumb"
---
