---
name: planning
description: Use when you need to plan technical solutions that are scalable, secure, and maintainable.
license: MIT
---

# Planning

Create detailed technical implementation plans through research, codebase analysis, solution design, and comprehensive documentation.

## When to Use

Use this skill when:
- Planning new feature implementations
- Architecting system designs
- Evaluating technical approaches
- Creating implementation roadmaps
- Breaking down complex requirements
- Assessing technical trade-offs

## Core Responsibilities & Rules

Always honoring **YAGNI**, **KISS**, and **DRY** principles.
**Be honest, be brutal, straight to the point, and be concise.**

### 1. Research & Analysis
Load: `references/research-phase.md`
**Skip if:** Provided with researcher reports

### 2. Codebase Understanding
Load: `references/codebase-understanding.md`
**Skip if:** Provided with scout reports

### 3. Impact & Solution Design
Load: `references/solution-design.md`
**Action:** Run impact analysis using `bun .gemini/skills/search_project/scripts/search.ts` to determine plan complexity.

### 4. Plan Creation & Organization
Load: `references/plan-organization.md`

### 5. Task Breakdown & Output Standards
Load: `references/output-standards.md`

## Workflow Process

1. **Initial Analysis** → Read codebase docs, understand context
2. **Impact Assessment** → **Run searches via `search_project` to quantify impact (Count files/lines). Decide: Simple vs Detailed Plan.**
3. **Research Phase** → Spawn researchers, investigate approaches
4. **Synthesis** → Analyze reports, identify optimal solution
5. **Design Phase** → Create architecture, implementation design
6. **Plan Documentation** → Write comprehensive plan (Single file or Multi-phase)
7. **Review & Refine** → Ensure completeness, clarity, actionability

## Output Requirements

- DO NOT implement code - only create plans
- Respond with plan file path and summary
- Ensure self-contained plans with necessary context
- Include code snippets/pseudocode when clarifying
- Provide multiple options with trade-offs when appropriate
- Fully respect the `./docs/development-rules.md` file.

**Plan Directory Structure**

Short plan (Low Impact):
```
.gemini/plans/
    ├── plan-<plan_short_summarization>-<Random ID>.md
    ├── ...
```

Detailed, multi-phase plan (High Impact):
```
plans/
└── <plan_short_summarization>-<Random ID>/
    ├── research/
    │   ├── researcher-XX-report.md
    │   └── ...
    ├── reports/
    │   ├── XX-report.md
    │   └── ...
    ├── scout/
    │   ├── scout-XX-report.md
    │   └── ...
    ├── plan.md
    ├── phase-XX-phase-name-here.md
    └── ...
```

## Quality Standards

- Be thorough and specific
- Consider long-term maintainability
- Research thoroughly when uncertain
- Address security and performance concerns
- Make plans detailed enough for junior developers
- Validate against existing codebase patterns

**Remember:** Plan quality determines implementation success. Be comprehensive and consider all solution aspects.
