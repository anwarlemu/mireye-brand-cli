# Mireye: what good looks like

Read by `mireye-ds review` every time, next to the reference screenshots in `brand/reference/` (the product UI boards
from Mireye's Figma identity, at the product scale).

## The idea

Mireye makes the physical world legible to AI agents. The interface reads like a survey sheet: a plain ground,
precise lines, and marks that say where something is and how sure we are. It is restrained, because Mireye sells to
enterprise: flat color, one ink, no gradients and no shadows.

## The product

- One ground. Pages are Bone (#F4F1EA), the brand's main color. Controls, fields, cards and panels are Bone too, each
  drawn with a 1px Stone line (#B9BDB7). Rules inside a panel are Mist (#DCDEDA).
- One ink: Forest (#1E231C) for text, the main action, strong lines and focus. Labels are Forest at 80 percent,
  annotations at 72 percent; placeholders and anything disabled are Slate (#8C918B). Moss, Fern and Lichen are for
  charts and accents; Earth supports. The Enterprise theme (data-brand="enterprise") swaps Forest for Umber.
- The cut corner is the only shape: a 45° chamfer at the top-left of keys, fields, cards, messages, dialogs and
  popups, taken from the cuts in the logomark. Nothing is rounded. Small parts (checks, rows, tags, avatars) are
  square.
- Survey marks carry state. A diamond is a node: solid means done or confirmed, outline means pending, a dot inside
  means current; diamonds are also bullets, steps and the chosen radio. Ticks (1px lines at a fixed pitch) show
  progress and loading. Contours and thin rules with nodes at their crossings frame maps.
- One face: Gilroy, Regular and Medium only. Controls and copy are 13px, labels and chips 12px, titles 16 to 24px
  regular. Hierarchy comes from size, color and space, never weight. Coordinates, IDs and values are DM Mono.
- The main action is a Forest cut key with a Bone medium label and an arrow; the second is a Bone cut key with a
  Forest line; text actions are 80 percent Forest with the arrow. One Forest key per view.
- Fields are 36px Bone cut frames; focus turns the line Forest. A unit sits at the end of the field (ac, ft, kV).
- Every value carries its source: cited fields, numbered sources, coordinates, precise numbers.
- Real photos only as accents, dimmed under map marks.

## Always

- Keep what each screen is for: its main action stays the most prominent thing, its key information easy to scan.
- For new pages, follow the user's brief. When only restyling existing UI, preserve its words, links, images, elements
  and behavior.
- Visible focus on every control (a 1px Forest outline 2px outside); touch targets at least 44px on phones. Slate sits
  under 4.5:1 on Bone: keep it for placeholders and disabled parts, never for copy a person must read.
- Rare onboarding, feedback and celebrations may use expressive motion; frequent interactions use subtle style changes;
  shortcuts, command palette toggles and other 100+ daily interactions are instant. Reduced motion disables animation.
- Hover steps a fill once (Forest a step lighter, Bone to Fog); press steps back at once, on pointer-down. Never
  a hatch, outline, shadow, size change or moving icon on hover. Loaders and spinners are the only designed motion. Reuse component variants and consistent section gutters.
- Audit debounces, artificial timers, transition waits and tap delay. Keep typing, filtering and feedback immediate;
  only essential nonblocking timers survive, with a specific `ds-latency` reason beside each call.

## Refuse

- Rounded corners, pills or circles, shadows, gradients, glows, bright saturated accents, a second ink color, bold or
  semibold type, decorative icons for status (use diamonds and ticks), stock imagery, more than one Forest key in a
  view.

## The website

The website uses the same look as the product. `brand/brand.json` lists one surface, `site`, and the engine treats that as the single look for pages and for product screens. The Enterprise theme (`data-brand="enterprise"`) swaps Forest for Umber. It is not a second design system.

The rules below are the ones already in `brand/site.css` and the `hero` element in `brand/elements.json`.

- The page ground is Bone (`--ds-color-bg-page`). Body type is the sans face at `--ds-text-body`.
- Titles use the display face at regular weight (`--ds-font-weight-heading`). Hierarchy comes from size, color and space, never weight.
- A page opens with its head: a 24px regular title and a 13px muted line, ruled off from the page by a 1px Stone line.
- Links are the ink, underlined.
- Focus is a 1px ink outline 2px outside the control, and it is square.
- Coordinates, IDs, values and code use the mono face.
- The hero rule says a 24px title. The hero-title prose says "20px regular ink". The hero-title CSS sets `font-size` to `--ds-text-h1`. All three are in `brand/elements.json`. This section does not choose between the 20px line and the 24px line.

### Do

- Build pages with the same components, tokens and cut corner as the product.
- Keep one filled key for the main action on a view.

### Don't

- Do not invent a marketing palette, a second typeface, rounded corners, pills or shadows.
- Do not set a nonzero corner radius. The radius tokens are 0. The only shape is the cut corner.

## Voice (for any text the agent must write, such as an alt text)

Plain, short and concrete. Sentence case, American spelling, no em dashes. Never "seamless", "revolutionary",
"cutting-edge", "unleash", "supercharge", "next-generation", "world-class", "leverage", "elevate".
