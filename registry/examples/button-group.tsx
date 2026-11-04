import { CaretDownIcon, MinusIcon, PlusIcon } from "@phosphor-icons/react/ssr";

import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";

export function Preview() {
  return (
    <ButtonGroup aria-label="Map layers">
      <Button variant="outline">Parcels</Button>
      <Button variant="outline">Substations</Button>
      <Button variant="outline">Floodplain</Button>
    </ButtonGroup>
  );
}

export function WithField() {
  return (
    <ButtonGroup className="w-full max-w-90">
      <ButtonGroupText>Min</ButtonGroupText>
      <Input aria-label="Minimum voltage" placeholder="e.g. 138" inputMode="numeric" />
      <ButtonGroupText>kV</ButtonGroupText>
    </ButtonGroup>
  );
}

export function Split() {
  return (
    <ButtonGroup>
      <Button arrow>Find sites</Button>
      <ButtonGroupSeparator />
      <Button size="icon" aria-label="More search options">
        <CaretDownIcon />
      </Button>
    </ButtonGroup>
  );
}

export function Vertical() {
  return (
    <ButtonGroup orientation="vertical" aria-label="Zoom">
      <Button variant="outline" size="icon" aria-label="Zoom in">
        <PlusIcon />
      </Button>
      <Button variant="outline" size="icon" aria-label="Zoom out">
        <MinusIcon />
      </Button>
    </ButtonGroup>
  );
}
