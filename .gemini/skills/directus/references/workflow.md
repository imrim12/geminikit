# Directus MCP Workflows

## 1. Schema Management: Adding/Updating Fields

Since the MCP focuses on *fields* rather than full schema snapshots, use this atomic workflow.

### Phase 1: Inspection
1.  **Check Collection**: Verify the collection exists.
    -   Tool: `read-collections`
2.  **Check Existing Fields**: See what fields already exist to avoid duplicates or conflicts.
    -   Tool: `read-fields` (filter by collection)

### Phase 2: Execution
1.  **Create Field**:
    -   Tool: `create-field`
    -   **Required**: `collection`, `field` (name), `type` (e.g., string, integer, boolean).
    -   **Schema**: Define `is_nullable`, `default_value`, `max_length` in the `schema` object.
    -   **Meta**: Define `interface` (input type), `display`, `required`, `hidden` in the `meta` object.
2.  **Update Field**:
    -   Tool: `update-field`
    -   Use this to change properties like `readonly`, `hidden`, or the interface options.

### Phase 3: Verification
1.  **Verify**: Read the field back to confirm settings.
    -   Tool: `read-field`

---

## 2. Content Management

### Phase 1: Discovery
1.  **Find Items**: Use filters to locate specific items.
    -   Tool: `read-items`
    -   *Tip*: Use `filter: { status: { _eq: "published" } }` style syntax.

### Phase 2: Mutation
1.  **Create**:
    -   Tool: `create-item`
    -   *Note*: Ensure you provide all required fields.
2.  **Update**:
    -   Tool: `update-item`
    -   *Note*: Partial updates are supported. Only send the fields you want to change.

### Phase 3: Verification
1.  **Read Back**: Immediately read the item using its ID to confirm the update persisted and triggers (if any) fired.

---

## 3. Automation (Flows)

1.  **List Flows**: Find the `manual` trigger flow you want to run.
    -   Tool: `read-flows`
2.  **Trigger**:
    -   Tool: `trigger-flow`
    -   **Context**: You usually need to provide the `collection` and `keys` (IDs) of the items the flow should act upon.
