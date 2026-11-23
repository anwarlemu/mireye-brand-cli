import { Command, PageBody, PageHead, Section } from "@www/components/chrome";
import { CopyText } from "@www/components/copy-text";
import { Shot, ShotGrid } from "@www/components/gallery";
import { inGroup, shown } from "@www/lib/gallery";
import { CLI_COMMAND } from "@www/lib/registry";

export const metadata = { title: "Assets" };

// Everything here was rendered by the CLI from the brand tokens, fonts, logo and layouts (scripts/build-gallery.mjs).
export default function AssetsPage() {
  const deck = inGroup("deck")[0];
  const videos = inGroup("video");
  return (
    <>
      <PageHead title="Assets" eyebrow="Guide" description="Share images, social posts, slides, clips and print files, drawn from the brand tokens, Gilroy and DM Mono, the mark and the brand's own layouts. Every example below is the command under it, run as is. Same input, same bytes." />
      <PageBody className="max-w-300">
        <Command command={`${CLI_COMMAND} manifest --json`} />
        <Section title="Posters" description="The brand's share-image layouts, each a fixed composition that redraws at any size: window, logo, post, parcels, isometric, aerial, tag, panel, chart, ask and partner lockup. Only the words you pass are drawn, whole; --sample fills them for a first look.">
          <ShotGrid entries={inGroup("posters")} />
        </Section>
        <Section title="Sizes and grounds" description="Every platform size: link preview, square, portrait, story, landscape, the X header, LinkedIn post, profile cover and page cover, YouTube channel art and thumbnail, email, profile picture, and any custom size. Words and the logo keep out of what each platform covers. Four grounds from the tokens: bone (the default), green, brown and black.">
          <ShotGrid entries={inGroup("sizes")} />
        </Section>
        <Section title="Sheets" description="The cut-frame sheet: one hairline frame with the brand's cut corner, the lockup, a mono footer and its tick row. Every size and ground; on banners the words sit beside the lockup.">
          <ShotGrid entries={inGroup("sheets")} cols="sm:grid-cols-2" />
        </Section>
        {deck && (
          <Section title="Deck" description="Slides at 1920 by 1080 from a JSON file: cover, section, statement, bullets, stat, quote, image, chart, any poster, closing. A PNG per slide and one PDF.">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {deck.files.filter((f) => f.endsWith(".png")).map((file) => (
                <Shot key={file} entry={{ ...deck, label: file.replace(/^deck-slide-\d+-|\.png$/g, "") }} file={file} />
              ))}
            </div>
            <CopyText value={shown(deck.command, CLI_COMMAND)} label="Copy the deck command" />
            <p className="text-body text-fg-muted">
              <a href="/gallery/deck.pdf" className="text-fg underline underline-offset-2 outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong">Open the sample PDF</a>
            </p>
          </Section>
        )}
        <Section title="Video" description="Short clips on the brand clock (ten times the base duration, eased with the brand ease-out, then held): APNG, MP4 or WebM, and the settled last frame as a still. Nothing loops and the mark never moves.">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {videos.map((v) => (
              <figure key={v.files[0]} className="grid min-w-0 content-start gap-2">
                <div className="overflow-hidden border border-line bg-subtle">
                  <video src={`/gallery/${v.files[0]}`} poster={`/gallery/${v.files[1]}`} controls muted playsInline preload="none" className="block h-auto w-full" aria-label={v.label} />
                </div>
                <figcaption className="font-mono text-caption text-fg-muted">{v.label}</figcaption>
                <CopyText value={shown(v.command, CLI_COMMAND)} label={`Copy the command for ${v.label}`} />
              </figure>
            ))}
          </div>
        </Section>
        <Section title="Merch" description="Print files at real size with bleed and safe area, from the approved lockup and mark, the grounds, the contours and the wireframe scenes. The sticker is cut on the brand's cut corner. Sizes are common vendor conventions: confirm against the vendor template. Shown at 72 dpi; files are 300 dpi.">
          <ShotGrid entries={inGroup("merch")} />
        </Section>
      </PageBody>
    </>
  );
}
