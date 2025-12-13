# Core Patterns of Sequential Thinking

## 1. Revision
**Concept:** The ability to go back and correct a previous assumption without restarting the entire process.
**Usage:** "Thought 5 [REVISION of Thought 2]: The API actually requires a POST request, not GET."
**Why:** Prevents building on shaky foundations.

## 2. Branching
**Concept:** Exploring multiple mutually exclusive paths in parallel before converging.
**Usage:**
- "Thought 3 [BRANCH A]: Implement using WebSocket."
- "Thought 3 [BRANCH B]: Implement using Long Polling."
- "Thought 4: Comparing A and B... A is better for battery life."
**Why:** Avoids local maxima; ensures trade-offs are explicitly evaluated.

## 3. Recursion / Decomposition
**Concept:** Breaking a large thought/problem into a sub-sequence of thoughts.
**Usage:** "Thought 2: The authentication logic is complex. Let's break it down." -> (Sub-sequence on Auth) -> "Thought 3: Auth logic defined."
**Why:** Handles complexity that won't fit in working memory.

## 4. Hypothesis Verification
**Concept:** Explicitly stating a guess and demanding proof before accepting it as a premise.
**Usage:**
- "Thought 6 [HYPOTHESIS]: The memory leak is in the image loader."
- "Thought 7 [VERIFICATION]: Run heap snapshot... Confirmed."
**Why:** Prevents "guess-driven development".
