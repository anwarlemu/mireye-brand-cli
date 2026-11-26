import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from "@/components/ui/code-block";

const ANSWER = `{
  "parcel": "042-117-09",
  "county": "Ellis",
  "coordinates": [32.4113, -96.8302],
  "acres": 212.6,
  "flood_zone": { "value": "X", "source": 1 },
  "elevation_ft": { "value": 412, "source": 2 },
  "slope_pct": { "value": 2.8, "source": 3 }
}`;

const SNIPPET = `import { Mireye } from "@acme/mireye-client";

// Ask about a parcel and read the cited values.
const mireye = new Mireye({ apiKey: process.env.MIREYE_API_KEY });
const answer = await mireye.ask("Check flood risk and terrain for 32.4113, -96.8302");`;

export function Preview() {
  return (
    <CodeBlock>
      <CodeBlockHeader>
        <CodeBlockTitle language="json">response.json</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={ANSWER} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent code={ANSWER} language="json" wrap />
    </CodeBlock>
  );
}

export function Script() {
  return (
    <CodeBlock>
      <CodeBlockHeader>
        <CodeBlockTitle>ask.ts</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={SNIPPET} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent code={SNIPPET} language="ts" />
    </CodeBlock>
  );
}
