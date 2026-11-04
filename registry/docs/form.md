---
name: form
title: Form
type: ui
surface: site
description: "A react-hook-form form in Mireye's field layout: each FormItem is a 12px label, the control 8px under it, then a 12px description or a brick message. A failing field turns only its control's line and its message brick."
use_for: "Use for a form with validation, such as site criteria. Wrap the control in FormControl so it gets the id, aria-describedby and aria-invalid; put FormMessage last. End with one default key with `arrow`, and set its `loading` while the form submits."
never: ["Validating on every keystroke before the first submit", "A message that replaces the label", "More than one default key"]
source: "Drawn from Figma \"UI · Inputs\" (442:107)"
---
