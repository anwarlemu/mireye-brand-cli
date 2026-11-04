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
7. The wordmark is not final, so the docs show the mark with the name set in Gilroy. `apps/www/components/logo.tsx`.
8. The site URL (https://mireye.com) is a placeholder until the product's domain is confirmed. `brand/brand.json`.
