import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

export function Preview() {
  return (
    <FieldGroup className="max-w-96">
      <Field>
        <FieldLabel htmlFor="f-size">Parcel size</FieldLabel>
        <Input id="f-size" defaultValue="41.2" inputMode="decimal" unit="ac" />
        <FieldDescription>Within 40 to 120 ac</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="f-location">Location</FieldLabel>
        <Input id="f-location" placeholder="Search any U.S. location" />
      </Field>
    </FieldGroup>
  );
}

export function Invalid() {
  return (
    <Field data-invalid className="max-w-96">
      <FieldLabel htmlFor="f-voltage">Minimum voltage</FieldLabel>
      <Input id="f-voltage" defaultValue="1200" unit="kV" aria-invalid aria-describedby="f-voltage-error" />
      <FieldError id="f-voltage-error">No transmission line in this county carries more than 500 kV.</FieldError>
    </Field>
  );
}

export function Horizontal() {
  return (
    <FieldGroup className="max-w-96">
      <Field orientation="horizontal">
        <Switch id="f-terrain" defaultChecked />
        <FieldLabel htmlFor="f-terrain">Terrain</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Checkbox id="f-flood" />
        <FieldContent>
          <FieldLabel htmlFor="f-flood">Exclude floodplain</FieldLabel>
          <FieldDescription>Drops parcels in FEMA zones A and AE.</FieldDescription>
        </FieldContent>
      </Field>
      <FieldSeparator>or</FieldSeparator>
      <Field orientation="horizontal">
        <Checkbox id="f-wet" defaultChecked />
        <FieldLabel htmlFor="f-wet">Exclude wetlands</FieldLabel>
      </Field>
    </FieldGroup>
  );
}

export function Fieldset() {
  return (
    <FieldSet className="max-w-96">
      <FieldLegend>Land use</FieldLegend>
      <FieldDescription>The zoning the site must already have.</FieldDescription>
      <RadioGroup defaultValue="industrial">
        <FieldLabel htmlFor="z-industrial">
          <Field orientation="horizontal">
            <RadioGroupItem value="industrial" id="z-industrial" />
            <FieldContent>
              <FieldTitle>Industrial</FieldTitle>
              <FieldDescription>I-1 and I-2, ready to build.</FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
        <FieldLabel htmlFor="z-agricultural">
          <Field orientation="horizontal">
            <RadioGroupItem value="agricultural" id="z-agricultural" />
            <FieldContent>
              <FieldTitle>Agricultural</FieldTitle>
              <FieldDescription>Needs a conditional use permit.</FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
      </RadioGroup>
    </FieldSet>
  );
}
