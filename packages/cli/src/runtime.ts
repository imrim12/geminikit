import * as cp from 'node:child_process'
import * as fs from 'node:fs'

const isBun = typeof Bun !== 'undefined'

export interface CommandResult {
  stdout: string
  stderr: string
  exitCode: number
}

export function runCommand(command: string[], options?: any): CommandResult {
  if (isBun) {
    const result = Bun.spawnSync(command, options || {})
    return {
      stdout: result.stdout ? result.stdout.toString() : '',
      stderr: result.stderr ? result.stderr.toString() : '',
      exitCode: result.exitCode,
    }
  }
  else {
    // Node.js implementation
    const [cmd, ...args] = command
    // map Bun options to Node options if necessary
    const nodeOptions: any = { ...options }
    if (nodeOptions.stderr === 'ignore')
      nodeOptions.stdio = ['pipe', 'pipe', 'ignore']
    if (nodeOptions.stdout === 'inherit')
      nodeOptions.stdio = ['pipe', 'inherit', 'pipe']
    // Simple mapping for common cases used in this CLI

    const result = cp.spawnSync(cmd, args, { encoding: 'utf-8', ...nodeOptions })
    return {
      stdout: result.stdout ? result.stdout.toString() : '',
      stderr: result.stderr ? result.stderr.toString() : '',
      exitCode: result.status ?? 1,
    }
  }
}

export async function readFile(filePath: string): Promise<string> {
  if (isBun) {
    return await Bun.file(filePath).text()
  }
  else {
    return fs.readFileSync(filePath, 'utf-8')
  }
}

export async function readJson(filePath: string): Promise<any> {
  if (isBun) {
    return await Bun.file(filePath).json()
  }
  else {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  }
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  if (isBun) {
    await Bun.write(filePath, content)
  }
  else {
    fs.writeFileSync(filePath, content, 'utf-8')
  }
}

export async function checkFileExists(filePath: string): Promise<boolean> {
  if (isBun) {
    return await Bun.file(filePath).exists()
  }
  else {
    return fs.existsSync(filePath)
  }
}

export async function copyFile(src: string, dest: string): Promise<void> {
  if (isBun) {
    await Bun.write(dest, Bun.file(src))
  }
  else {
    fs.copyFileSync(src, dest)
  }
}
