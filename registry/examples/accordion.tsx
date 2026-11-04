import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function Preview() {
  return (
    <Accordion type="single" collapsible defaultValue="flood" className="w-full max-w-120">
      <AccordionItem value="flood">
        <AccordionTrigger>How is flood risk checked?</AccordionTrigger>
        <AccordionContent>The parcel is matched against the national flood hazard layer. Zone X means outside the 100-year and 500-year flood plains.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="power">
        <AccordionTrigger>Which substations count as nearby?</AccordionTrigger>
        <AccordionContent>Substations at 138 kV or above within 2 mi of the parcel edge, measured in a straight line.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="sources">
        <AccordionTrigger>Where do the values come from?</AccordionTrigger>
        <AccordionContent>Every value cites its source: county parcel records, the utility&apos;s interconnection queue and a 10 m elevation model.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function Multiple() {
  return (
    <Accordion type="multiple" defaultValue={["parcel", "terrain"]} className="w-full max-w-120">
      <AccordionItem value="parcel">
        <AccordionTrigger>Parcel</AccordionTrigger>
        <AccordionContent>042-117-09, 212.6 ac, zoned I-2 Industrial.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="terrain">
        <AccordionTrigger>Terrain</AccordionTrigger>
        <AccordionContent>412 ft average elevation, 2.8% slope.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="water" disabled>
        <AccordionTrigger>Water (no source yet)</AccordionTrigger>
        <AccordionContent>No water source has been matched for this county.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
