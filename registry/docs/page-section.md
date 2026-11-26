---
name: page-section
title: Page section
type: block
group: blocks
surface: site
description: "The survey frame every website section sits in: 1px Stone rails at the content edges, a rule edge to edge at the top, a solid Forest diamond at each crossing, an optional mono label, title and intro."
use_for: "Use as the outer wrapper of any website section so pages read as one survey sheet. Pass label, title and intro for the head (title left, intro right on wide screens) and the section's content as children. Pass `closing` on the last section of a page to draw the bottom rule. SECTION_GUTTER, SECTION_COLUMN and SECTION_INSET align anything else (a header) to the rails; SITE_LINK and SiteLockup are the website's link and lockup."
never: ["Rounded corners or shadows", "Sections without the rails on a page that has them", "Nodes anywhere but where two rules cross", "Coloured section grounds"]
source: "Mireye website (mireye-website, read-only): PageRails and page-rails.css (rails at the content edges, rules at section boundaries, nodes at crossings), section-rhythm.css"
---
