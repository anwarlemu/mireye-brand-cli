---
name: chat-input
title: Chat input
type: product
surface: product
description: "The composer: a text area that grows with the question, the site chip and Ask, in the large cut frame."
use_for: "Use under a conversation. Pass `placeholder`, `site` (a SiteChip), `textareaProps` for the value and an `onSubmit`. `submitDisabled` disables Ask and Enter while the question is empty; `loading` keeps Enter from sending while the agent answers; `compact` makes Ask the chip's height."
never: ["A send icon in place of Ask", "A composer taller than its question", "Sending on Shift+Enter"]
source: "Figma \"UI · Agent chat\" (443:433): frame 443:455"
files: ["components/ui/chat-input.tsx"]
---
