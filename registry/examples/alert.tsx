import { CheckCircleIcon, InfoIcon, WarningIcon, XCircleIcon } from "@phosphor-icons/react/ssr";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function Preview() {
  return (
    <Alert className="max-w-160">
      <InfoIcon />
      <AlertTitle>Values are cited</AlertTitle>
      <AlertDescription>Every value in a report links to the record it came from: county parcels, the interconnection queue or the elevation model.</AlertDescription>
    </Alert>
  );
}

export function Muted() {
  return (
    <Alert variant="muted" className="max-w-160">
      <InfoIcon />
      <AlertDescription>Parcels under 5 ac are left out of results for this buy box.</AlertDescription>
    </Alert>
  );
}

export function Warning() {
  return (
    <Alert variant="warning" className="max-w-160">
      <WarningIcon />
      <AlertTitle>Partial data for Navarro County</AlertTitle>
      <AlertDescription>Zoning is not published for 14 of its parcels.</AlertDescription>
      <AlertAction>Updated Oct 28</AlertAction>
    </Alert>
  );
}

export function Success() {
  return (
    <Alert variant="success" className="max-w-160">
      <CheckCircleIcon />
      <AlertTitle>Report ready</AlertTitle>
      <AlertDescription>Ellis County site 14 meets 9 of 9 requirements.</AlertDescription>
    </Alert>
  );
}

export function Destructive() {
  return (
    <Alert variant="destructive" className="max-w-160">
      <XCircleIcon />
      <AlertTitle>The elevation source did not respond</AlertTitle>
      <AlertDescription>Slope and elevation are missing from this answer. Try again in a few minutes.</AlertDescription>
      <AlertAction>
        <Button variant="outline" size="sm">Retry</Button>
      </AlertAction>
    </Alert>
  );
}
