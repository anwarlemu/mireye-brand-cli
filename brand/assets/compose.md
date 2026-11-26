# Compose blocks: where each comes from

`design new compose` lays these blocks on a 12 by 12 grid (12 by 6 on headers) inside the platform's safe area. Nothing
here is new brand design: each block is a part the share-image layouts already draw (brand/assets/image.json), or is built
only from those parts and the tokens.

From the share-image layouts:

- headline, body: the posters' headline (tight, -0.014 tracking, 1.04 leading) and the line under it (muted, 1.42).
- badge: the mono label after a diamond, as the parcels and app layouts mark coordinates.
- logo, mark: the lockup and the mark; clear space is the mark's height all round (logoRules), kept inside the block's cells.
- pattern: the contour field (brand/assets/contours.json), faded round everything drawn on it.
- panel: the window (identity, window) and the filled tag window; words on a filled window take its ink.
- picture: a picture covering its cells with the cut corner (`--ds-cut`); with no file, the wire drawing the photo layout uses.
- art, scene: the illustration skill's wire drawings and the isometric scenes.
- stat: the stat layout's number with its tick row.
- card: the event layout's filled card.
- list: the pricing and flow layouts' points (diamonds, or mono numbers).
- chart: the chart layout's hatched outline bars, the line layout's line with diamonds, the donut layout's ring.
- button, search: the app panel's chamfered key and its field.

Built from the parts and the tokens (not in the share-image tool):

- table: rows in the sans, the head row in the mono face and muted ink, hairlines in the ink at 35 percent.
- code: the mono face in an outlined block with the cut corner (the site's code block is a Bone block in DM Mono).
- divider: the window's hairline with a diamond at each end.
- icon: the brand's icon set (brand/icons, licences in brand/icons/icons.json), in the ink.

Recipes (`adapter.compose.recipe`) rebuild every image template from these blocks; test/compose-page.test.ts draws each
at og, square, story and the X and LinkedIn headers and checks it.
