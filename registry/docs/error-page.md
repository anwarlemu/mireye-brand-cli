---
name: error-page
title: Error page
type: block
group: pages
surface: site
description: "The server error page (500, 503): the code in DM Mono, one line that owns the fault, a way to try again and the status page, beside an empty survey plate."
use_for: "Use as the app's or site's error boundary page. Pass `code`, `title`, `retry` and `status` (null when there is no status page)."
never: ["Stack traces or error ids as the headline", "Blaming the user", "Jokes"]
source: "Derived: the website has only a not-found page; this keeps its layout (not-found.tsx and NotFoundScene)."
---
