import { TypographyBlockquote, TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyInlineCode, TypographyLarge, TypographyLead, TypographyList, TypographyMuted, TypographyP, TypographySmall, TypographyTable } from "@/components/ui/typography";

export function Preview() {
  return (
    <article className="w-full max-w-160">
      <TypographyH3>Ellis County site 14</TypographyH3>
      <TypographyMuted>212.6 ac assembled from three parcels, 0.8 mi from a 345 kV substation.</TypographyMuted>
      <TypographyP>
        The site sits at <TypographyInlineCode>32.4113, -96.8302</TypographyInlineCode>, outside the 100-year flood plain, with municipal water along the north edge.
      </TypographyP>
      <TypographyBlockquote>Zone X: an area of minimal flood hazard, outside the 0.2 percent annual chance flood plain.</TypographyBlockquote>
      <TypographyList>
        <li>Parcel records from the county appraisal district.</li>
        <li>Substations and queue status from the grid operator.</li>
        <li>Elevation and slope from a 10 m elevation model.</li>
      </TypographyList>
      <TypographyTable>
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Flood zone</td>
            <td>Zone X</td>
          </tr>
          <tr>
            <td>Elevation</td>
            <td>412 ft</td>
          </tr>
        </tbody>
      </TypographyTable>
    </article>
  );
}

export function Scale() {
  return (
    <div className="grid w-full max-w-160 gap-3">
      <TypographyH1>Sites near Waxahachie</TypographyH1>
      <TypographyH2>Ellis County site 14</TypographyH2>
      <TypographyH3>Loading terrain</TypographyH3>
      <TypographyH4>Power</TypographyH4>
      <TypographyLead>Find land that meets your requirements, with every value cited.</TypographyLead>
      <TypographyLarge>9 of 9 requirements met</TypographyLarge>
      <TypographySmall>Updated Oct 28, 2026 from county records.</TypographySmall>
      <TypographyList ordered>
        <li>Describe the site you need.</li>
        <li>Review the matches and their sources.</li>
      </TypographyList>
    </div>
  );
}
