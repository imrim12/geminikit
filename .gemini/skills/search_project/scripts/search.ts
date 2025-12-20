import { spawn } from "bun";

const args = Bun.argv.slice(2);
let pattern = "";
let includeExternal = false;

// Manual argument parsing
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--pattern" && args[i + 1]) {
    pattern = args[i + 1];
    i++;
  } else if (args[i] === "--include-external") {
    includeExternal = true;
  }
}

if (!pattern) {
  console.error("Error: --pattern argument is required");
  process.exit(1);
}

// Helper to run command and get output
async function runCommand(cmd: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = spawn(cmd, {
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  return { stdout, stderr, exitCode };
}

async function main() {
  // 1. Try ripgrep (rg)
  try {
    const rgArgs = ["rg", "-n", "--smart-case", "--color=never"]; // -n for line numbers
    if (includeExternal) {
      rgArgs.push("-uu"); // Search hidden and ignored files
    }
    rgArgs.push(pattern);

    // Check if rg exists first (by running version)
    // Actually, just running it directly is usually fine, checking error
    const rgCheck = await runCommand(["rg", "--version"]);
    
    if (rgCheck.exitCode === 0) {
      const { stdout, stderr, exitCode } = await runCommand(rgArgs);
      // rg returns exit code 1 if no matches found, which is fine, not an error
      if (exitCode === 0 || exitCode === 1) {
         if (stdout.trim().length === 0) {
            console.log("No matches found.");
         } else {
             console.log(stdout.trim());
         }
         process.exit(0);
      } else {
         // Real error from rg
         console.error("ripgrep error:", stderr);
         process.exit(exitCode);
      }
    }
  } catch (e) {
    // rg not found or spawn failed
  }

  // 2. Fallback to git grep
  // Only valid if we are NOT asking for external/ignored files (git grep only searches tracked)
  if (!includeExternal) {
    try {
      const gitArgs = ["git", "grep", "-I", "-n", pattern]; // -I ignore binary, -n line numbers
      const { stdout, stderr, exitCode } = await runCommand(gitArgs);

      if (exitCode === 0 || exitCode === 1) {
          if (stdout.trim().length === 0) {
            console.log("No matches found.");
          } else {
            console.log(stdout.trim());
          }
          process.exit(0);
      }
       // If git grep fails (e.g. not a git repo), we continue to error
    } catch (e) {
      // git failed
    }
  }

  // 3. Failure
  console.error("Error: Could not perform search.");
  console.error("Requirement: 'ripgrep' (rg) must be installed.");
  console.error("Fallback: 'git grep' is attempted but failed (or not applicable for external search).");
  console.error("Please install ripgrep: see .gemini/skills/search_project/references/installation.md");
  process.exit(1);
}

main();
