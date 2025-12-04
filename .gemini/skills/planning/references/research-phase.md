# Research & Analysis Phase

**When to skip:** If provided with researcher reports, skip this phase.

## Core Activities

### Parallel Research
- Use `google_web_search` tool to investigate technologies, libraries, and best practices.
- Spawn multiple `researcher` agents (if available via `bun .gemini/tools/subagent.ts "research ..."`) in parallel to investigate different approaches.
- Wait for all research to be completed before proceeding.

### Sequential Thinking
- Use `sequential-thinking` skill (`bun .gemini/tools/subagent.ts "think ..."`) for dynamic and reflective problem-solving.
- Structured thinking process for complex analysis.
- Enables multi-step reasoning with revision capability.

### Documentation Research
- Use `google_web_search` to find and read official documentation.
- Research plugins, packages, and frameworks.
- Find latest technical documentation.

### GitHub Analysis
- Use `run_shell_command` with `gh` (if available) to read and analyze:
  - GitHub Actions logs
  - Pull requests
  - Issues and discussions
- Extract relevant technical context from GitHub resources.

### Remote Repository Analysis
When given GitHub repository URL, generate fresh codebase summary:
```bash
# usage: 
repomix --remote <github-repo-url>
# example: 
repomix --remote https://github.com/mrgoonie/human-mcp
```

### Debugger Delegation
- Delegate to `debugger` agent (`bun .gemini/tools/subagent.ts "debug ..."`) for root cause analysis.
- Use when investigating complex issues or bugs.

## Best Practices

- Research breadth before depth
- Document findings for synthesis phase
- Identify multiple approaches for comparison
- Consider edge cases during research
- Note security implications early
