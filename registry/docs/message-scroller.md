---
name: message-scroller
title: Message Scroller
type: ui
surface: site
description: "A conversation's scroll area that opens at the newest message, stays pinned to it as messages arrive, and offers a square Bone Jump to latest key once the reader scrolls up."
use_for: "Wrap a conversation: MessageScroller, then MessageScrollerViewport around MessageScrollerContent, one MessageScrollerItem per message, and a MessageScrollerButton. Give the scroller a fixed height (it fills its parent). Set scrollAnchor on the item the person just sent so the reply grows below it. Use MessageScrollerProvider to reach the scroller from outside (a composer), and the hooks useMessageScroller, useMessageScrollerScrollable and useMessageScrollerVisibility for custom controls. The thread fades at an edge (fade-y) where more messages scroll past it."
never: [Sliding the jump key in and out, A shadow under the jump key, Scrolling away from what the reader is reading when a message arrives, A scroller without a fixed height]
source: "Not in Figma (no full chat screen yet): built for the agent chat parts of UI · Agent chat (443:433), for a designer's review"
---
