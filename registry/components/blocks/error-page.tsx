import * as React from "react";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter, type SiteFooterProps } from "@/components/blocks/site-footer";
import { SiteHeader, type SiteHeaderProps } from "@/components/blocks/site-header";
import { SurveyPlate } from "@/components/blocks/survey-plate";
import { Button } from "@/components/ui/button";

// The server error page (500, 503): the code in DM Mono, one line that says the fault is ours, a way to try again and
// the status page, beside the survey plate with its parcel struck through. Built on the not-found page's layout.

export type ErrorPageProps = { header?: SiteHeaderProps; code?: string; title?: string; description?: string; retry?: { label: string; href: string }; status?: { label: string; href: string } | null; footer?: SiteFooterProps };

export function ErrorPage({ header, code = "500 · Server error", title = "Something broke on our side.", description = "Nothing you did caused this. Try again in a moment; if it keeps happening, the status page says what we know.", retry = { label: "Try again", href: "" }, status = { label: "Status page", href: "#status" }, footer }: ErrorPageProps) {
  return (
    <div data-slot="error-page" className="min-h-dvh bg-page font-sans text-fg">
      <SiteHeader {...header} />
      <main>
        <PageSection>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="grid content-start gap-5">
              <p className="font-mono text-caption leading-tight text-fg-muted">{code}</p>
              <h1 className="text-display leading-display font-normal text-balance text-fg">{title}</h1>
              <p className="max-w-(--ds-layout-text) text-body-lg leading-body text-fg-secondary">{description}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild>
                  <a href={retry.href}>
                    {retry.label}
                    <ArrowRightIcon size={20} />
                  </a>
                </Button>
                {status && (
                  <Button asChild variant="outline">
                    <a href={status.href}>{status.label}</a>
                  </Button>
                )}
              </div>
            </div>
            <SurveyPlate className="aspect-4/3 w-full" marker={null} caption="The survey could not finish" scale={null} parcels={[{ x: 30, y: 28, w: 40, h: 44, state: "plain", label: code.split(" ")[0] }]} />
          </div>
        </PageSection>
      </main>
      <SiteFooter {...footer} />
    </div>
  );
}
