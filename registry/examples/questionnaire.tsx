"use client";

import * as React from "react";

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire";

const ITEMS = [
  { name: "size", required: true, choices: [{ value: "50" }, { value: "200" }, { value: "500" }] },
  { name: "needs", multiple: true, choices: [{ value: "power" }, { value: "water" }, { value: "rail" }, { value: "fiber" }] },
  { name: "when", required: true, choices: [{ value: "now" }, { value: "year" }, { value: "later" }] },
] as const;

function Saved({ answers }: { answers: string }) {
  return (
    <p role="status" className="ds-cut px-4 py-3 text-body text-fg [--ds-shape-fill:var(--ds-color-bg-subtle)]">
      Saved. {answers}
    </p>
  );
}

export function Preview() {
  const [saved, setSaved] = React.useState<string>();
  return (
    <div className="mx-auto grid w-full max-w-110 gap-4">
      <Questionnaire
        items={ITEMS}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSaved(`Size: ${data.get("size")}+ ac. Needs: ${data.getAll("needs").join(", ") || "none"}. When: ${data.get("when")}.`);
        }}
      >
        <QuestionnaireProgress />
        <QuestionnaireItem name="size" required>
          <QuestionnaireTitle>How much land do you need?</QuestionnaireTitle>
          <QuestionnaireDescription>Choose a minimum, or type your own.</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="50">
              <span>50+ ac</span>
              <QuestionnaireChoiceDescription>A warehouse or a small solar site</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
            <QuestionnaireChoice value="200">
              <span>200+ ac</span>
              <QuestionnaireChoiceDescription>A data center campus</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
            <QuestionnaireChoice value="500">
              <span>500+ ac</span>
              <QuestionnaireChoiceDescription>Utility-scale solar or storage</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
            <QuestionnaireInput aria-label="Another minimum, in acres" placeholder="Another minimum, in acres" />
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireItem name="needs" multiple>
          <QuestionnaireTitle>What must be on or near the site?</QuestionnaireTitle>
          <QuestionnaireDescription>Choose any, or skip this question.</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="power">138 kV or above within 2 mi</QuestionnaireChoice>
            <QuestionnaireChoice value="water">Municipal water</QuestionnaireChoice>
            <QuestionnaireChoice value="rail">A rail spur</QuestionnaireChoice>
            <QuestionnaireChoice value="fiber">Fiber at the road</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireItem name="when" required>
          <QuestionnaireTitle>When do you need it?</QuestionnaireTitle>
          <QuestionnaireDescription>Timing changes which sites the agent puts first.</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="now">Now</QuestionnaireChoice>
            <QuestionnaireChoice value="year">Within a year</QuestionnaireChoice>
            <QuestionnaireChoice value="later">Later than a year</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireSkip />
          <QuestionnaireNext />
          <QuestionnaireSubmit>Save buy box</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
      {saved && <Saved answers={saved} />}
    </div>
  );
}

const PLAN = [{ name: "state", required: true, choices: [{ value: "tx" }, { value: "ok" }, { value: "nm" }] }] as const;

export function Disabled() {
  return (
    <Questionnaire items={PLAN} shortcuts="letters" className="mx-auto max-w-110" onSubmit={(event) => event.preventDefault()}>
      <QuestionnaireItem name="state" required>
        <QuestionnaireTitle>Which state should the search cover?</QuestionnaireTitle>
        <QuestionnaireDescription>Parcel data for New Mexico is not loaded yet.</QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="tx">
            <span>Texas</span>
            <QuestionnaireChoiceDescription>254 counties</QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="ok">
            <span>Oklahoma</span>
            <QuestionnaireChoiceDescription>77 counties</QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="nm" disabled>
            <span>New Mexico</span>
            <QuestionnaireChoiceDescription>Not loaded yet</QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnaireSubmit>Start search</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}
