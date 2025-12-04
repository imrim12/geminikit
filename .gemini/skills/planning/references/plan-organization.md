# Plan Creation & Organization

## Impact Analysis & Complexity Decision

**Before creating a plan, you MUST evaluate the impact of changes.**

1.  **Search & Count**: Run `findstr` or `grep` for key terms associated with the feature/bug.
2.  **Evaluate**:
    *   **Low Impact**: Affects < 5 files.
    *   **High Impact**: Affects > 5 files or involves core architecture/database schemas.
3.  **Decide Structure**:
    *   **Simple Plan**: Use a single markdown file in `node_modules/.geminikit/`.
    *   **Detailed Plan**: Use the folder structure in `plans/` with separate phase files.

## Directory Structure

### Plan Location

**Simple Plan (Low Impact)**:
Save plans in `node_modules/.geminikit/` directory with a short summarization string to avoid collisions.
Format: `node_modules/.geminikit/plan-<plan_short_summarization>-<Random ID>.md`
Example: `node_modules/.geminikit/plan-fix_bug_login-34hjh4.md`

**Detailed Plan (High Impact)**:
Save plans in `plans/` directory with a dedicated folder.
Format: `plans/<plan_short_summarization>-<Random ID>/`
Example: `plans/auth_refactor-98k2j1/`

### File Organization

**Option A: Simple Plan (Single File)**
```
node_modules/.geminikit/
    ├── plan-fix_bug_login-34hjh4.md
    ├── plan-change-button-color-67gdo4.md
    └── ...
```

**Option B: Detailed Multi-Phase Plan (Folder)**
```
plans/
├── 20251101-1505-authentication-and-profile-implementation/
    ├── research/
    │   ├── researcher-XX-report.md
    │   └── ...
│   ├── reports/
│   │   ├── scout-report.md
│   │   ├── researcher-report.md
│   │   └── ...
│   ├── plan.md                                # Overview access point
│   ├── phase-01-setup-environment.md          # Setup environment
│   ├── phase-02-implement-database.md         # Database models
│   ├── phase-03-implement-api-endpoints.md    # API endpoints
│   ├── phase-04-implement-ui-components.md    # UI components
│   ├── phase-05-implement-authentication.md   # Auth & authorization
│   ├── phase-06-implement-profile.md          # Profile page
│   ├── phase-07-write-tests.md                # Tests
│   ├── phase-08-run-tests.md                  # Test execution
│   ├── phase-09-code-review.md                # Code review
│   ├── phase-10-project-management.md         # Project management
│   ├── phase-11-onboarding.md                 # Onboarding
│   └── phase-12-final-report.md               # Final report
└── ...
```

## File Structure

### Overview Plan (plan-<ID>.md)
- Keep generic and under 80 lines
- List each phase with status/progress
- Link to detailed phase files (if separated, though single file is preferred for small tasks)
- High-level timeline
- Key dependencies

### Phase Details (Inside Plan File or Linked)
Fully respect the `./docs/development-rules.md` file.
Each phase section should contain:

**Context Links**
- Links to related reports, files, documentation

**Overview**
- Date and priority
- Current status
- Brief description

**Key Insights**
- Important findings from research
- Critical considerations

**Requirements**
- Functional requirements
- Non-functional requirements

**Architecture**
- System design
- Component interactions
- Data flow

**Related Code Files**
- List of files to modify
- List of files to create
- List of files to delete

**Implementation Steps**
- Detailed, numbered steps
- Specific instructions

**Todo List**
- Checkbox list for tracking

**Success Criteria**
- Definition of done
- Validation methods

**Risk Assessment**
- Potential issues
- Mitigation strategies

**Security Considerations**
- Auth/authorization
- Data protection

**Next Steps**
- Dependencies
- Follow-up tasks
