import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function Preview() {
  return (
    <RadioGroup defaultValue="industrial" aria-label="Zoning">
      <RadioGroupItem value="industrial">Industrial</RadioGroupItem>
      <RadioGroupItem value="agricultural">Agricultural</RadioGroupItem>
      <RadioGroupItem value="mixed">Mixed use</RadioGroupItem>
    </RadioGroup>
  );
}

export function States() {
  return (
    <RadioGroup defaultValue="30" aria-label="Search radius" className="grid-flow-col gap-6">
      <RadioGroupItem value="10">10 mi</RadioGroupItem>
      <RadioGroupItem value="30">30 mi</RadioGroupItem>
      <RadioGroupItem value="100" disabled>
        100 mi
      </RadioGroupItem>
    </RadioGroup>
  );
}
