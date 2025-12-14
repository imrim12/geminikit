#!/usr/bin/env node

import * as path from 'node:path'
import { config } from 'dotenv' // Load environment variables from .env file
import { runDoctor } from './doctor'
import { handleLogCommand } from './log'
import { checkFileExists, readJson, runCommand } from './runtime'
import { runSetup } from './setup'
import { runUpdate } from './update'

config()

const args = process.argv.slice(2)

async function main() {
  if (args.length === 0) {
    printHelp()
    process.exit(0)
  }

  const command = args[0]

  if (command === '--version' || command === '-v') {
    await printVersion()
  }
  else if (command === '--help' || command === '-h' || command === 'help') {
    printHelp()
  }
  else if (command === 'log') {
    await handleLogCommand(args.slice(1))
  }
  else if (command === 'doctor') {
    runDoctor()
  }
  else if (command === 'setup') {
    runSetup()
  }
  else if (command === 'update') {
    await runUpdate()
  }
  else {
    console.error(`Unknown command: ${command}`)
    printHelp()
    process.exit(1)
  }
}

async function printVersion() {
  try {
    // 1. Gemini CLI Version
    let geminiVersion = 'Not installed'
    try {
      const result = runCommand(['gemini', '--version'], { stderr: 'ignore' })
      if (result.stdout) {
        geminiVersion = result.stdout.toString().trim()
      }
    }
    catch {
      // Ignore error if gemini is not found
    }

    // 2. GeminiKit Version
    let geminiKitVersion = 'Not installed'
    try {
      // Check in node_modules (Consumer project)
      const userNodeModulesPath = path.join(process.cwd(), 'node_modules', 'geminikit', 'package.json')

      // Check in Monorepo Root (Dev environment)
      const monorepoRootPath = path.resolve(__dirname, '..', '..', '..', 'package.json')

      if (await checkFileExists(userNodeModulesPath)) {
        const pkg = await readJson(userNodeModulesPath)
        geminiKitVersion = pkg.version
      }
      else if (await checkFileExists(monorepoRootPath)) {
        const pkg = await readJson(monorepoRootPath)
        if (pkg.name === 'geminikit') {
          geminiKitVersion = pkg.version
        }
      }
    }
    catch {
      // Ignore
    }

    // 3. GeminiKit CLI Version
    const packageJsonPath = path.join(__dirname, '..', 'package.json')
    let cliVersion = 'unknown'

    if (await checkFileExists(packageJsonPath)) {
      const packageJson = await readJson(packageJsonPath)
      cliVersion = packageJson.version
    }

    console.log(`Gemini CLI version:     ${geminiVersion}`)
    console.log(`GeminiKit version:      ${geminiKitVersion}`)
    console.log(`GeminiKit CLI version:  ${cliVersion}`)
  }
  catch (error) {
    console.error('Error retrieving version information:', error)
    process.exit(1)
  }
}

function printHelp() {
  console.log(`
Usage: gk <command> [options]

Commands:
  setup          Setup Gemini Kit environment (Bun, Gemini CLI, .gemini config)
  update         Update the local .gemini configuration from the installed package
  doctor         Check health of Gemini Kit installation
  log            Manage/View telemetry logs
                 Options: -o, --output <file>  Output processed logs to a specific file
  --version, -v  Show version information
  --help, -h     Show this help message
`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
