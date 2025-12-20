---
name: search_project
description: High-performance codebase search using indexed tools (ripgrep). Strictly forbids slow, non-indexed tools (findstr, grep) to ensure speed and token efficiency.
---

# Project Search Skill

Performs instant, indexed searches across the codebase using `ripgrep` (primary) or `git grep` (fallback).

## When to Use

Use this skill when:
- Finding all occurrences of a function, variable, or string.
- Searching for specific patterns (e.g., "TODO", "FIXME").
- Performing impact analysis before refactoring.
- Exploring codebase structure via keyword density.

**Do NOT use for**:
- File existence checks (use `ls` or standard file API).
- Reading file content (use `read_file`).

## Prerequisites

**STRICT REQUIREMENT**: This skill requires `ripgrep` (rg) to be installed on the system.
- If `rg` is missing, it will attempt to fallback to `git grep`.
- If `git grep` fails, it will **ABORT**.
- **Native OS commands (findstr, grep, Select-String) are BANNED** due to performance and output verbosity issues.

## Usage

Run the search script via Bun:

```bash
bun .gemini/skills/search_project/scripts/search.ts --pattern "<search-term>" [--include-external]
```

### Options

- `--pattern`: The string or regex to search for.
- `--include-external`: (Boolean) If set, searches hidden files and ignored files (equivalent to `rg -uu`).

## Protocols

### 1. Indexed-Only Policy
We do not use `findstr` or recursive `ls` loops for content searching. If the optimized tools are missing, we stop and ask the user to install them.

### 2. Output Efficiency
The script returns concise `file:line:content` formatted output suitable for LLM parsing.

## References

- `references/installation.md`: How to install `ripgrep`.
