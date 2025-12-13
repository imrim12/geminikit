#!/usr/bin/env node
import { config } from 'dotenv';
config(); // Load environment variables from .env file

import { handleLogCommand } from './log';
import { runDoctor } from './doctor';
import { runSetup } from './setup';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const args = process.argv.slice(2);

if (args.length === 0) {
  printHelp();
  process.exit(0);
}

const command = args[0];

if (command === '--version' || command === '-v') {
  printVersion();
} else if (command === '--help' || command === '-h' || command === 'help') {
  printHelp();
} else if (command === 'log') {
  handleLogCommand(args.slice(1));
} else if (command === 'doctor') {
  runDoctor();
} else if (command === 'setup') {
  runSetup();
} else {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

function printVersion() {
  try {
    // 1. Gemini CLI Version
    let geminiVersion = 'Not installed';
    try {
      geminiVersion = execSync('gemini --version', { stdio: 'pipe' }).toString().trim();
    } catch (e) {
      // Ignore error if gemini is not found
    }

    // 2. GeminiKit Version
    let geminiKitVersion = 'Not installed';
    try {
        // Check in node_modules (Consumer project)
        const userNodeModulesPath = join(process.cwd(), 'node_modules', 'geminikit', 'package.json');
        
        // Check in Monorepo Root (Dev environment)
        // __dirname is packages/cli/dist (compiled) or packages/cli/src (ts-node)
        // We assume compiled: packages/cli/dist/index.js -> packages/cli/package.json (..) -> packages (../..) -> root (../../..)
        const monorepoRootPath = resolve(__dirname, '..', '..', '..', 'package.json');

        if (existsSync(userNodeModulesPath)) {
            const pkg = JSON.parse(readFileSync(userNodeModulesPath, 'utf-8'));
            geminiKitVersion = pkg.version;
        } else if (existsSync(monorepoRootPath)) {
             const pkg = JSON.parse(readFileSync(monorepoRootPath, 'utf-8'));
             if (pkg.name === 'geminikit') {
                 geminiKitVersion = pkg.version;
             }
        }
    } catch (e) {
        // Ignore
    }

    // 3. GeminiKit CLI Version
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const cliVersion = packageJson.version;

    console.log(`Gemini CLI version:     ${geminiVersion}`);
    console.log(`GeminiKit version:      ${geminiKitVersion}`);
    console.log(`GeminiKit CLI version:  ${cliVersion}`);
  } catch (error) {
    console.error('Error retrieving version information:', error);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
Usage: gk <command> [options]

Commands:
  setup          Setup Gemini Kit environment (Bun, Gemini CLI, .gemini config)
  doctor         Check health of Gemini Kit installation
  log            Manage/View telemetry logs
                 Options: -o, --output <file>  Output processed logs to a specific file
  --version, -v  Show version information
  --help, -h     Show this help message
`);
}