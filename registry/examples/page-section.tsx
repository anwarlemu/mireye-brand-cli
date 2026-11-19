import { PageSection } from "@/components/blocks/page-section";
import { Button } from "@/components/ui/button";

export function Preview() {
  return (
    <div className="pt-6">
      <PageSection label="Coverage" title="Every value carries its source." intro="Point at a parcel and the answer comes back with the record it was read from and the date." />
      <PageSection closing space="compact">
        <p className="text-body text-fg-secondary">The last section on a page closes the rails with the bottom rule and its nodes.</p>
      </PageSection>
    </div>
  );
}

export function WithActions() {
  return (
    <div className="py-6">
      <PageSection
        closing
        label="Platform"
        title="Screen every parcel in a county."
        intro="Describe the site you need. The platform checks each parcel against it and shortlists the ones that fit."
        actions={
          <>
            <Button>Open the platform</Button>
            <Button variant="ghost" arrow>
              Read the docs
            </Button>
          </>
        }
      />
    </div>
  );
}
