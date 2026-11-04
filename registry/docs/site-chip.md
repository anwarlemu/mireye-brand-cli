---
name: site-chip
title: Site chip
type: product
surface: product
description: "The site a question is about, as coordinates in a Fog chip with the small cut and an optional remove key."
use_for: "Use in the chat composer (ChatInput's `site`) or above it. `onRemove` adds a remove key with a 24px hit area; the chip leaves before it calls back. When the label changes, the chip eases to its new width and the new coordinates rise in. `icon={false}` drops the parcel icon."
never: ["Several chips in one composer", "Free text that is not a location", "A chip without a way to clear it in a composer"]
source: "Figma \"UI · Agent chat\" (443:433): 443:458 and 443:503"
files: ["components/ui/site-chip.tsx"]
---
