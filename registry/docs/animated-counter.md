---
name: animated-counter
title: Animated counter
type: product
surface: product
description: "A number that animates to its new value: counting through every value, or rolling each digit."
use_for: "Use for counts that change in place: parcels screened, requirements met. `animation=\"count\"` (default) counts in 0.4s on a quint ease-out; `animation=\"roll\"` rolls each digit on a spring with no bounce. The first render is still; under reduced motion the number swaps at once."
never: ["Animating a number on first render", "Counters on values the person types", "Long counts over 0.4s"]
source: "Not in Figma; motion follows the system's ease-out"
files: ["components/ui/animated-counter.tsx"]
---
