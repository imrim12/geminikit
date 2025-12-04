import { spawn } from "child_process";

const prompt = process.argv[2];

if (!prompt) {
  console.error("Usage: bun .gemini/tools/subagent.ts <prompt>");
  process.exit(1);
}

// Execute gemini with the prompt as a positional argument
// We use 'inherit' to pipe stdout/stderr directly to the parent process
const child = spawn("gemini", [prompt], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, CI: "true" } // set CI=true to potentially force headless/non-interactive mode if supported
});

child.on("error", (err) => {
    console.error("Failed to start subprocess:", err);
    process.exit(1);
});

child.on("close", (code) => {
  process.exit(code ?? 0);
});
