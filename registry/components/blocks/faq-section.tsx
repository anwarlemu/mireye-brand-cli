"use client";

import * as React from "react";

import { PageSection, type PageSectionProps } from "@/components/blocks/page-section";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Questions in groups, as on the website's pricing page: each group's name on the left in Forest at 72%, its questions
// on the right as an accordion ruled in Mist. The first question of the first group starts open. The accordion's own
// motion applies (height under 200ms, ease-out); nothing else moves.

export type QuestionGroup = { group: string; entries: { question: string; answer: React.ReactNode }[] };

const GROUPS: QuestionGroup[] = [
  {
    group: "The data",
    entries: [
      { question: "Where does the data come from?", answer: "County assessors, utilities, federal flood and elevation layers, and permit offices. Every value carries its source and the date it was read." },
      { question: "Which places do you cover?", answer: "Any U.S. location: a parcel, an address or a coordinate. Coverage varies by field and county; the response says when a value is missing." },
      { question: "How fresh is it?", answer: "Each source is read on its own schedule, from daily for permits to yearly for assessor rolls. The date travels with the value." },
    ],
  },
  {
    group: "Billing",
    entries: [
      { question: "What counts as a request?", answer: "One call to the API, whatever it returns. Batch calls count once per place." },
      { question: "What happens if I go over my plan?", answer: "Extra requests are billed at your plan's rate. Nothing stops your agent mid-run." },
    ],
  },
];

export type FaqSectionProps = Omit<PageSectionProps, "children"> & { groups?: QuestionGroup[] };

export function FaqSection({ label = "Questions", title = "Questions, answered.", intro = "Anything else? Write to the team and an engineer answers.", groups = GROUPS, ...props }: FaqSectionProps) {
  return (
    <PageSection label={label} title={title} intro={intro} {...props}>
      <div className="grid gap-10">
        {groups.map((g, gi) => (
          <div key={g.group} className="grid gap-3 border-t border-line pt-1 lg:grid-cols-3 lg:gap-10">
            <h3 className="pt-3 text-body leading-body font-normal text-fg-muted">{g.group}</h3>
            <Accordion type="single" collapsible defaultValue={gi === 0 ? `${g.group}-0` : undefined} className="lg:col-span-2">
              {g.entries.map((e, i) => (
                <AccordionItem key={e.question} value={`${g.group}-${i}`}>
                  <AccordionTrigger>{e.question}</AccordionTrigger>
                  <AccordionContent className="max-w-(--ds-layout-text)">{e.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </PageSection>
  );
}
