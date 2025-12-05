#!/usr/bin/env bun
import { runGemini } from './gemini';
import { handleLogCommand } from './log';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const args = process.argv.slice(2);

if (args.includes('--version') || args.includes('-v')) {
  try {
    let geminiVersion = 'Unknown';
    try {
      geminiVersion = execSync('gemini --version').toString().trim();
    } catch (e) {
      // Ignore error if gemini is not found
    }

    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const kitVersion = packageJson.version;

    console.log(`Gemini CLI version: ${geminiVersion}\nGemini Kit version: ${kitVersion}`);
  } catch (error) {
    console.error('Error retrieving version information:', error);
    process.exit(1);
  }
} else if (args[0] === 'log') {
  handleLogCommand(args.slice(1));
} else {
  runGemini(args);
}


