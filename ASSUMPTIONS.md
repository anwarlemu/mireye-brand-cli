# Assumptions for the brand owner to confirm

Each is in force today; each names where it lives, so a change is one edit.

1. Source. Values come from Mireye's Figma identity ("Mireye (INT)", page 3.2 Brand identity): the two palettes
   (331:7, 331:37) and the product UI boards (442:2), read from Figma's Dev Mode output in the review build of
   29 to 31 October 2026. `brand/tokens.css`.
2. Scale. Figma draws the product at a 1920px presentation scale. The library runs at 0.6 of it, snapped to a 4px
   grid: 36px keys and fields (Figma 64), 13px controls and copy (Figma 20 to 22), 12px labels (Figma 16 to 18), cuts
   of 8, 6, 10 and 5px (Figma 12, 10, 16 and 8). `brand/tokens.css`, `--ds-scale` in `registry/lib/utils.ts`.
3. Gilroy is a paid font. The review build included it for review only and its license for Mireye still needs
   confirming. It ships in this private repo (`brand/fonts/`) and on the protected docs site. `brand/brand.json`.
4. Not designed yet, so chosen in the palette: success, warning and danger colors; dialogs, sheets, menus, popovers,
   tooltips, toasts and calendars; the type ramp above 16px; page and section titles; the docs site layout. Each is
   built from the brand's grammar (white cut frames, 1px Stone lines, Forest ink, diamonds and ticks).
   `brand/tokens.css`, `registry/docs`.
5. Hover follows the brand's later review (a single fill step, no hatch). The brand guide also moved arrows 2px on
   hover; this library keeps icons still, an Agencidev rule for every brand.
6. Enterprise · Earth swaps the roles the palette board names (ink, inverse fills, strong lines, the main action and
   its hover) for Umber and Bark. Figma has no Enterprise UI boards. `brand/tokens.css`.
7. The wordmark is not final, so the docs show the mark with the name set in Gilroy. `apps/www/components/logo.tsx`. The image command uses the same lockup.
8. The site URL (https://mireye.com) is a placeholder until the product's domain is confirmed. `brand/brand.json`. Imagery uses its host as the default footer.
9. Social and Open Graph sheets are not in the Figma file. `image` composes the cut-frame sheets from the tokens, Gilroy, DM Mono and the logomark. Poster type and the cut are larger than the product UI so the signature still reads. DM Mono is vendored under the SIL Open Font License (`brand/fonts/DMMono-OFL.txt`) so a render does not fetch a font.
10. The poster layouts, sizes and sample copy are the agd-playground Mireye tool's (`src/components/mireye-og` at 4536d86). Where it disagrees with the tokens, the tokens win: Bone #F4F1EA (tool #f3f0eb), Forest #1E231C for ink and the green ground (tool #000000 ink, #262b26 green, also the illustration skill's green), black #000000 (tool #060606), DM Mono for data (tool Geist Mono), Gilroy Regular for the chart numbers (tool Light) and Medium for a partner name (tool SemiBold). Muted inks without a token map to the nearest one (sage to #C9CDC8, warm gray to Sand). Each note is in `brand/assets/image.json`.
11. The tool sets mireye.com's lowercase wordmark beside the mark; images use this repo's lockup (the mark with the name in Gilroy, assumption 7) in the same box. Swap it in `src/image/logo.ts` callers once the wordmark is final.
12. The aerial (photo) template needs the user's picture: the tool's stock photos are not shipped. The darkening shade is the black token at the tool's 0.56. The Ask panel's colors map to tokens (`brand/assets/image.json` app).
13. Wireframe illustrations run the brand illustration skill's toolkit and scenes unchanged (`brand/illustrate/wire`); their tones are the skill's own. Deck slides follow the skill's slide rule (lockup top left at 64, a 104 headline bottom left); other slide sizes (title 72, body 36, labels 24) are the posters' ratios at 1920. Merch sizes, bleeds and safe areas are vendor conventions to confirm, and the sticker die line is a cut corner. The brand defines no logo clear-space or minimum size; see 14.
14. Logo clear space and minimum size are not defined by the brand. Pictures keep a working rule until they are: clear space of the mark's own height all round and a mark never under 8 CSS pixels tall at the width the picture is usually shown. `brand/assets/image.json` logoRules.
15. Reading floors for pictures are working values, not brand rules: small type is never under 9 CSS pixels and a headline never under 14 at the width each size is usually shown (`brand/assets/image.json` floors; the widths are in `src/design/platforms.ts` and are approximate). Where platforms publish where they cover a picture (story bars, YouTube's safe area) those numbers are used; the X and LinkedIn profile pictures and the thumbnail's time stamp are measured, so approximate.
16. The aerial's shade is the black token at 0.58 (the tool's 0.56 left bone words at 4.4:1 over a white picture).
