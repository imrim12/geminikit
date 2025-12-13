import * as path from 'node:path'

export function getProjectRoot(): string {
  // If run via npm/bun, INIT_CWD is the directory where the command was run
  if (process.env.INIT_CWD) {
    return process.env.INIT_CWD
  }
  return process.cwd()
}

export async function readSettings(projectRoot: string): Promise<any> {
  const settingsPath = path.join(projectRoot, '.gemini', 'settings.json')
  const file = Bun.file(settingsPath)

  if (!(await file.exists())) {
    return null
  }

  const content = await file.text()
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
