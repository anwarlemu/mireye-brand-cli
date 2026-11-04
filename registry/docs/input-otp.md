---
name: input-otp
title: Input OTP
type: ui
surface: site
description: "A one-time code: one 36px square per character, each the field's frame with the compact 6px cut, 8px apart, with 16px DM Mono characters. The next slot's line turns Forest with a blinking caret; invalid turns every line brick."
use_for: "Use for sign-in and verification codes. Set `maxLength` and `pattern` (REGEXP_ONLY_DIGITS for numeric codes); split long codes into groups with a separator. Say where the code was sent below it."
never: ["One field per character that the reader must tab through", "Rounded slots", "A code shown in the sans face"]
source: "Not in Figma; drawn from the field (442:107)"
---
