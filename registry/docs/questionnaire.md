---
name: questionnaire
title: Questionnaire
type: ui
surface: site
description: "Questions asked one at a time: Bone cut-frame choice cards with the diamond radio or the square checkbox and a shortcut key, a typed answer, a count over the tick bar, and Previous, Skip and Next."
use_for: "Use when the agent or a setup flow needs a few answers in a row (a buy box: how much land, what must be near, when). Pass the questions as items to Questionnaire, then render a QuestionnaireItem per question with a QuestionnaireTitle, a QuestionnaireDescription, QuestionnaireChoices of QuestionnaireChoice (add QuestionnaireInput for another answer) and a QuestionnaireError; end with QuestionnaireActions holding Previous, Skip, Next and Submit. Mark required questions; set multiple to allow several answers. onSubmit receives the native form event: read the answers with FormData."
never: [More than one question on screen, Animating between questions, A required question without its error message, A filled card for a chosen answer, Round radios]
source: "Figma UI · Controls (442:145): the diamond radio and the checkbox; UI · Inputs (442:107): the field's cut frame; UI · Progress (442:213): the tick bar"
---
