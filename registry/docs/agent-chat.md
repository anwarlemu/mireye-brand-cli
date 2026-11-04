---
name: agent-chat
title: Agent chat
type: product
surface: product
description: "The Ask Mireye panel built from the system's parts: the panel, a map strip, suggestions, follow-ups, the survey frame and an elevation profile."
use_for: "Put a conversation in `ChatPanel` (title, `onClose`, `footer` for the composer; `framed` for the cut corner and header nodes). In the empty state show `MapStrip` and `ChatSuggestions`; wrap the composer in `SurveyFrame` and put `ChatFollowUps` on it after an answer. `ProfileChart` draws an elevation profile in ticks."
never: ["Sliding parts in; they enter in place", "A chat without the site it is about", "Suggestions as a dropdown"]
source: "Figma chat explorations (434:2): \"Chat 12\" and \"Chat 16\""
files: ["components/ui/agent-chat.tsx"]
---
