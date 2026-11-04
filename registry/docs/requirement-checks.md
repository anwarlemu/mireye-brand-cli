---
name: requirement-checks
title: Requirement checks
type: product
surface: product
description: "A site checked against a buy box: one row per requirement with its result, rule, value, weight and source."
use_for: "Use on a parcel record. Put `RequirementCheck` rows (result, field, requirement, value, kind, source) inside `RequirementChecks` with a title and summary. A failed Must requirement fills its row Fog and says Fail in Medium. Rows still screening say Screening and land in place as results arrive. Narrow containers stack each row."
never: ["Red rows for failures", "Hiding unknown readings; they say Unknown", "Sorting by result; keep buy box order"]
source: "Not in Figma yet; built from the product survey of the parcel record and existing marks"
files: ["components/ui/requirement-checks.tsx"]
---
