# Directus API Testing & Permission Verification

Use this protocol to verify schema security and logic by simulating different user roles.
**Note**: The MCP tools (`read-items`, etc.) typically run with Admin/High privileges. To test *Role Based Access Control (RBAC)*, you must use external scripts to simulate restricted users.

## Prerequisites

-   **Admin Access**: The project environment must allow creating users.
-   **Base URL**: Typically `http://localhost:8055`.

## Workflow

### 1. Strategy: "Trust but Verify"
Do not assume the schema permissions work. Actively try to break them.
-   **Positive Test**: Attempt an action that *should* be allowed. (Expect: 200/204)
-   **Negative Test**: Attempt an action that *should* be forbidden. (Expect: 403)

### 2. User Management (Test Fixtures)
Use a script to create transient test users, login, and attempt actions.

#### script: `verify-permissions.ts` (Template)
Create this script in a temp folder when needed.

```typescript
// run with: bun verify-permissions.ts
const BASE_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const ADMIN_TOKEN = process.env.DIRECTUS_TOKEN; // Ensure this is available in environment

async function main() {
  try {
    // 1. Setup: Create Test User with specific Role
    const roleName = "Editor"; // CHANGE THIS
    console.log(`Creating test user for role: ${roleName}...`);
    
    // (Implementation details would involve fetching role ID, creating user, getting token)
    // For brevity, ensure you have a way to generate a token for the role.
    
    // 2. Test: Attempt Access
    // const token = ...;
    // const response = await fetch(`${BASE_URL}/items/sensitive_data`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    
    // 3. Assert
    // if (response.status !== 403) throw new Error("Security hole detected!");
    
    console.log("Verification Passed");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    // 4. Cleanup: Delete test user
  }
}

main();
```

## Protocol: Quick Check
If you just need to verify the *existence* of data or fields (as Admin), use the MCP tools:
-   `read-collections`
-   `read-items`

Only use the script method when specifically validating **security policies** for non-admin users.