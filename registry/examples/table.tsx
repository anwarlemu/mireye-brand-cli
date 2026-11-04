import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SUBSTATIONS = [
  { name: "Waxahachie North", county: "Ellis", kv: 345, distance: 0.8, queue: "Open" },
  { name: "Ennis East", county: "Ellis", kv: 138, distance: 2.4, queue: "Open" },
  { name: "Corsicana", county: "Navarro", kv: 138, distance: 6.1, queue: "Full" },
  { name: "Kaufman South", county: "Kaufman", kv: 69, distance: 9.7, queue: "Open" },
];

export function Preview() {
  return (
    <Table>
      <TableCaption>Substations within 10 mi of parcel 042-117-09.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Substation</TableHead>
          <TableHead>County</TableHead>
          <TableHead className="text-right">Voltage</TableHead>
          <TableHead className="text-right">Distance</TableHead>
          <TableHead>Queue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SUBSTATIONS.map((s) => (
          <TableRow key={s.name}>
            <TableCell>{s.name}</TableCell>
            <TableCell className="text-fg-secondary">{s.county}</TableCell>
            <TableCell className="text-right tabular-nums">{s.kv} kV</TableCell>
            <TableCell className="text-right tabular-nums">{s.distance.toFixed(1)} mi</TableCell>
            <TableCell>
              <Badge variant={s.queue === "Open" ? "default" : "secondary"}>{s.queue}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function WithFooter() {
  return (
    <Table variant="framed">
      <TableHeader>
        <TableRow>
          <TableHead>Parcel</TableHead>
          <TableHead>Zoning</TableHead>
          <TableHead className="text-right">Acres</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-mono text-caption">042-117-09</TableCell>
          <TableCell>I-2 Industrial</TableCell>
          <TableCell className="text-right tabular-nums">141.3</TableCell>
        </TableRow>
        <TableRow data-state="selected">
          <TableCell className="font-mono text-caption">042-117-10</TableCell>
          <TableCell>I-2 Industrial</TableCell>
          <TableCell className="text-right tabular-nums">48.9</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-mono text-caption">042-118-02</TableCell>
          <TableCell>Agricultural</TableCell>
          <TableCell className="text-right tabular-nums">22.4</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Assembled site</TableCell>
          <TableCell className="text-right tabular-nums">212.6</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

export function Interactive() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Site</TableHead>
          <TableHead className="text-right">Acres</TableHead>
          <TableHead className="text-right">Fit</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          ["Ellis County site 14", "212.6", "9 of 9"],
          ["Navarro County site 3", "305.0", "7 of 9"],
          ["Kaufman County site 8", "198.2", "6 of 9"],
        ].map(([site, acres, fit]) => (
          <TableRow key={site} data-interactive="">
            <TableCell>
              <a href="#site" className="outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong">
                {site}
              </a>
            </TableCell>
            <TableCell className="text-right tabular-nums">{acres}</TableCell>
            <TableCell className="text-right tabular-nums">{fit}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
