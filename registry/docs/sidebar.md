---
name: sidebar
title: Sidebar
type: ui
surface: site
description: "The app's rail: 212px of white with a 1px Stone edge, square 32px rows (Fog under the pointer, Mist when current), group labels as 1px-framed chips, a Forest count; it folds to glyphs, slides away or opens as a sheet on phones."
use_for: "Use for an app's main navigation beside the canvas (Ask, Map, Saved sites, Reports, then labelled groups such as Layers). Wrap the app in SidebarProvider; put the lockup in SidebarHeader, groups of SidebarMenuItem in SidebarContent and Help and the account in SidebarFooter. Mark the current row with isActive. Use collapsible=\"icon\" to fold to glyphs (give each row a tooltip), variant=\"secondary\" for a second rail of projects on the canvas, and SidebarMenuBadge for a count or a short mark."
never: [Rounded or pill rows, Filled or bold glyphs, Coloured rows, Icons that move on hover, A rail wider than 212px, Shadows]
source: "Mireye docs site spec (the 212px white rail, square rows, framed group chips) and the rail's Fog hover and Mist current, for a designer's review"
---
