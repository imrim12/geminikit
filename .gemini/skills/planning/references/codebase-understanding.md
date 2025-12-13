# Codebase Understanding Phase

**When to skip:** If provided with scout reports, skip this phase.

## Core Activities

### Codebase Investigation
- Use `codebase_investigator` tool to build a comprehensive map of the project structure, dependencies, and key files.
- Use `grep` (via `run_shell_command`) or `read_file` to inspect specific implementations.
- If available, use the `scout` command (or spawn a "scout ..." subagent) to locate relevant files across the codebase.

### Essential Documentation Review
ALWAYS read these files first:

1. **`./docs/development-rules.md`** (IMPORTANT)
   - File Name Conventions
   - File Size Management
   - Development rules and best practices
   - Code quality standards
   - Security guidelines

2. **`./docs/codebase-summary.md`**
   - Project structure and current status
   - High-level architecture overview
   - Component relationships

3. **`./docs/code-standards.md`**
   - Coding conventions and standards
   - Language-specific patterns
   - Naming conventions

4. **`./docs/design-guidelines.md`** (if exists)
   - Design system guidelines
   - Branding and UI/UX conventions
   - Component library usage

### Environment Analysis
- Review development environment setup
- Analyze dotenv files and configuration
- Identify required dependencies
- Understand build and deployment processes

### Pattern Recognition
- Study existing patterns in codebase
- Identify conventions and architectural decisions
- Note consistency in implementation approaches
- Understand error handling patterns

### Integration Planning
- Identify how new features integrate with existing architecture
- Map dependencies between components
- Understand data flow and state management
- Consider backward compatibility

## Best Practices

- Start with documentation before diving into code
- Use `codebase_investigator` for broad context
- Document patterns found for consistency
- Note any inconsistencies or technical debt
- Consider impact on existing features