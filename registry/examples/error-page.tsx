import { ErrorPage } from "@/components/blocks/error-page";

export function Preview() {
  return <ErrorPage />;
}

export function Unavailable() {
  return <ErrorPage code="503 · Down for maintenance" title="We are updating the records." description="The service is back within the hour." status={null} />;
}
