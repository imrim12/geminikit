---
name: directus
description: Manage Directus content, schema (fields), files, and flows via the Directus Model Context Protocol (MCP) server. Provides atomic control over the Directus instance without needing direct Docker access.
---

# Directus Manager (MCP)

This skill enables interaction with a Directus instance through the `@directus/content-mcp` server. It allows for managing content items, schema fields, files, and triggering automation flows.

## Capabilities

### 1. Content Management
- **Read Items**: Query any collection with filtering, sorting, and deep nesting (`read-items`).
- **Create/Update Items**: Add or modify records (`create-item`, `update-item`).
- **Comments**: detailed discussions on items (`read-comments`, `upsert-comment`).

### 2. Schema Management
- **Read Schema**: Inspect collections and fields (`read-collections`, `read-fields`).
- **Manage Fields**: Create or update field definitions (`create-field`, `update-field`).
- **Note**: Creating new *Collections* (tables) is not currently supported by this MCP. Use the Directus Admin App for creating new collections, then use this skill to populate them with fields.

### 3. File & Asset Management
- **Manage Files**: Upload (import), update metadata, and read file details (`read-files`, `import-file`, `update-files`).
- **Folders**: Organize assets (`read-folders`).

### 4. Automation
- **Flows**: Trigger manual flows (`read-flows`, `trigger-flow`).

## Protocols

### 1. Inspect-Plan-Execute
**NEVER** blindly guess field names or IDs.
1.  **Inspect**: Use `read-collections`, `read-fields`, or `read-items` to understand the current structure and data.
2.  **Plan**: Determine exactly which fields or items need to be changed.
3.  **Execute**: Call the appropriate tool (`create-field`, `update-item`, etc.).

### 2. Verification
After any modification, verify the state.
-   **Content**: Read back the item (`read-items`) to ensure data was saved correctly.
-   **Schema**: Read back the field (`read-field`) to ensure options/types are correct.

### 3. System Collections
-   You cannot read/write directly to system collections (e.g., `directus_collections`, `directus_users`) via `read-items`.
-   Use specialized tools like `read-collections` or `read-users` (if available) for system data.

## References

-   **Workflow Guide**: `references/workflow.md`
-   **API/Permission Testing**: `references/api-testing.md`
