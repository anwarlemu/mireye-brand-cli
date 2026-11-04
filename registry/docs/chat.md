---
name: chat
title: Chat
type: product
surface: product
description: "The parts of a conversation with the agent: ChatMessage, ChatSteps and ChatInput, the composer."
use_for: "Compose a turn from the sent `ChatMessage`, the agent's `ChatSteps` in the past tense, the answer and its CitedFields, then `ChatInput` with a SiteChip. Enter sends and Shift+Enter starts a line; `loading` walks Ask's ticks while the agent answers. AgentChat puts the whole panel together."
never: ["Speech bubbles or avatars", "Agent steps in the present tense once done", "A composer without a visible label or placeholder"]
source: "Figma \"UI · Agent chat\" (443:433)"
files: ["components/ui/chat.tsx"]
---
