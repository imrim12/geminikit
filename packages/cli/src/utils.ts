import * as path from 'node:path'
import { checkFileExists, readFile } from './runtime'

export function getProjectRoot(): string {
  // If run via npm/bun, INIT_CWD is the directory where the command was run
  if (process.env.INIT_CWD) {
    return process.env.INIT_CWD
  }
  return process.cwd()
}

export async function readSettings(projectRoot: string): Promise<any> {
  const settingsPath = path.join(projectRoot, '.gemini', 'settings.json')

  if (!(await checkFileExists(settingsPath))) {
    return null
  }

  const content = await readFile(settingsPath)
  // Simple comment stripping (handles /* block */ and // line comments)
  const jsonContent = content.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1')
  try {
    return JSON.parse(jsonContent)
  }
  catch (e) {
    console.error('Failed to parse settings.json', e)
    return null
  }
}
