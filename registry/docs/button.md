---
name: button
title: Button
type: ui
surface: site
description: "Mireye's keys with the cut corner: the Forest primary (default), the framed secondary (outline, a Forest line on Bone), a Fog key (secondary), the text button (ghost: an 80% Forest label that turns Forest), destructive and link. 36px tall with 16px sides and a 13px medium label; the fill steps once on hover and back at once on press. Loading walks a tick bar, or turns the Dial on icon keys."
use_for: "Use one default key per view for the action that moves the task forward (Find sites), with `arrow` for a forward action. Use outline for the actions beside it and for icon keys (size icon, always with aria-label), ghost for a low-weight action inside content (add `arrow` when it goes somewhere), secondary for a quiet key in a toolbar or on a dark ground, destructive for the one destructive action in a dialog, and link for an action inside text. Set `loading` while the action runs: the key keeps its size and ignores clicks. Use size sm (32px) for the chat Ask key and dense rows."
never: ["Rounded corners or a shadow", "A hatch, outline, shadow or size change on hover", "An arrow or icon that moves on hover", "A spinner other than the Dial or the tick bar", "Two Forest keys side by side", "Bold or uppercase labels", "A faded (half-opacity) disabled key"]
source: "Figma \"UI · Buttons\" (442:3): Primary, Secondary, Text and Icon rows in Default, Hover, Loading and Disabled; the chat Ask key (443:464)"
---
