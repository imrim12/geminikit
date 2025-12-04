#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Initialize server
const server = new McpServer({
  name: "saas-ops-tools",
  version: "1.0.0",
});

// Define schemas explicitly
const generateApiKeySchema = z.object({
  prefix: z.string().default("sk_live_").describe("Key prefix (e.g., sk_live_)"),
  length: z.number().default(32).describe("Length of the random segment"),
});
type GenerateApiKeyArgs = z.infer<typeof generateApiKeySchema>;

const calculateSaasMetricsSchema = z.object({
  active_users: z.number(),
  arpu: z.number().describe("Average Revenue Per User"),
  churn_rate: z.number().optional().describe("Monthly churn rate in percent (e.g. 0.05)"),
});
type CalculateSaasMetricsArgs = z.infer<typeof calculateSaasMetricsSchema>;

const scaffoldSaasRouteSchema = z.object({
  resourceName: z.string().describe("Name of the resource (e.g., 'users')"),
});
type ScaffoldSaasRouteArgs = z.infer<typeof scaffoldSaasRouteSchema>;


// Tool: Generate Secure API Key
server.registerTool(
  "generate-api-key",
  {
    description: "Generates a secure, prefixed API key for SaaS users.",
    inputSchema: generateApiKeySchema,
  },
  async ({ prefix, length }: GenerateApiKeyArgs) => {
    const randomPart = crypto.getRandomValues(new Uint8Array(length)) // Fixed Uint8array typo
      .reduce((t, e) => t + e.toString(16).padStart(2, '0'), '');
    return {
      content: [{ type: "text", text: `${prefix}${randomPart}` }],
    };
  }
);

// Tool: Calculate SaaS Metrics (MRR)
server.registerTool(
  "calculate-saas-metrics",
  {
    description: "Calculates MRR and projected ARR based on user count and ARPU.",
    inputSchema: calculateSaasMetricsSchema,
  },
  async ({ active_users, arpu, churn_rate }: CalculateSaasMetricsArgs) => {
    const mrr = active_users * arpu;
    const arr = mrr * 12;
    let analysis = `MRR: $${mrr.toFixed(2)}
ARR: $${arr.toFixed(2)}`;

    if (churn_rate) {
      const lost_revenue = mrr * churn_rate;
      analysis += `
Churn Risk: $${lost_revenue.toFixed(2)}/mo`;
    }

    return {
      content: [{ type: "text", text: analysis }],
    };
  }
);

// Tool: Scaffold Route (Filesystem Helper)
server.registerTool(
  "scaffold-saas-route",
  {
    description: "Generates a standard file structure for a new API route.",
    inputSchema: scaffoldSaasRouteSchema,
  },
  async ({ resourceName }: ScaffoldSaasRouteArgs) => {
    // In a real app, this might write files, but for safety we return the plan
    return {
      content: [{ type: "text", text: `Plan for scaffolding ${resourceName}:
1. Create model in /models
2. Create controller in /controllers
3. Create route in /routes` }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
