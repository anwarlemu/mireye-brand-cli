# Illustration rules

Mireye draws the physical world as a survey would: thin lines on a solid ground, nothing shaded, nothing rounded.
`illustrate` writes every style below as SVG (real vector shapes) and PNG; the same input always writes the same
bytes. Each rule names its source.

## Styles

| Style | What it is | Source |
|---|---|---|
| `wire` | Hidden-line isometric wireframes: filled line bands, faint x-ray lines for hidden edges, one spacing scale. Nine scenes. | The brand illustration skill (mireye-wireframe-illustrations), its toolkit and scenes vendored unchanged in `brand/illustrate/wire/` |
| `iso` | Quick isometric line drawings: one ink, faces in the ground color, one hatched parcel picked out in the window color. Six presets, or a scene text. | agd-playground `src/components/mireye-og/iso.ts` (the share-image tool) |
| `contours` | The topographic contour fields, dense and sparse. | mireye.com `public/brand/contours-bone.svg` and `index-contours-bone.svg`, as carried by the playground (`contours.ts`) |
| `trace` | Any picture as contours: brightness read as height and cut into isolines. | The contour style above, applied to the user's own picture (`--image`) |

## Wireframe rules (from the skill)

1. True isometric only: azimuth 45 degrees, elevation atan(1/sqrt 2). Scale S 2.6 px per world unit; a scene redrawn for
   a smaller frame exports its own S rather than being scaled down (`datacenter-post` is the campus at S 1.67).
2. Every line is a filled band with exact joints, never a stroke. Weights 1.0 (volumes), 0.7 (details), 0.5 (hatching,
   seams, grid); x-ray 0.45.
3. Every gap between parallel lines is 1, 2, 4, 6 or 12 px clear, derived from the kit's tokens, never typed by eye.
4. Tones on a dark ground are mixes of Earth #2A2119 toward #F4EFE6 (lit #FBF8F2, hi #E0DAD2, mid #BBB5AD, lo #8F8880,
   faint #6D655D, x-ray #524A42). Tones on bone run from #000000 to #C3C1BB. One path per tone, faint to strong.
5. Grounds: green for API, marketing, posts and decks (the default), brown for Enterprise material, bone for light posts
   and slides. Finished designs never use pure white.
6. One big main object per illustration, open ground around it; product ideas (API, agents, MCP) are abstract objects
   with no labels, icons or fake UI.
7. Placing: fill about 78 percent of the frame's width and 80 percent of its height (`--size`); the tile is 1536 by 1024
   with the drawing at 72 percent (`--tile`); on a deck slide the drawing may bleed off the right and bottom.

New wireframe scenes are written with the skill (its audit and QC gate), then added to `brand/illustrate/wire/scenes`
and `brand/illustrate/wire.json`. The CLI only runs scenes; it never invents geometry.

## Isometric and contour rules (from the playground and site)

1. Isometric scenes use one ink at 1.6 px (scaled with the frame), round joins, faces filled with the ground so nearer
   things hide what is behind them, and parcels hatched at 0.6 of the line with circle nodes at their corners.
2. The picked-out parcel takes the ground's window color: Forest on bone, Bone on green and brown, Earth on black.
3. Contours are 1.1 px strokes in the ground's grid color at its alpha (Forest at 0.22 on bone, Bone at 0.2 on green,
   0.18 on brown, 0.16 on black), scaled to cover the frame.
4. A traced picture uses the same 1.1 px line in the ground's ink; small scraps are dropped and the field is smoothed
   so the lines read as terrain, not as an outline of the photo.

## Colors

Grounds and inks come from `brand/tokens.css` through `brand/assets/image.json`: Bone #F4F1EA, Forest #1E231C, Earth
#2A2119, black #000000. The skill and the playground use green #262B26; the tokens' Forest wins. The wireframe tones
are the skill's own and are only used inside wireframe drawings.

## Never

- Rounded shapes, gradients, shadows or glows.
- Pure white, or any color outside the tokens and the wireframe tones.
- Scaling a wireframe scene down to fit a small frame when a redraw at a smaller S exists.
- Third-party logos or photos in an illustration; a user's own picture goes in through `--image`.
