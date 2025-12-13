import * as path from 'node:path'
import { getProjectRoot, readSettings } from './utils'

export async function handleLogCommand(args: string[]) {
  const projectRoot = getProjectRoot()
  const settings = await readSettings(projectRoot)

  if (!settings || !settings.telemetry || !settings.telemetry.outfile) {
    console.error('Error: Telemetry outfile not configured in settings.json')
    process.exit(1)
  }

  let telemetryFile = settings.telemetry.outfile
  if (!path.isAbsolute(telemetryFile)) {
    telemetryFile = path.resolve(projectRoot, telemetryFile)
  }

  const file = Bun.file(telemetryFile)
  if (!(await file.exists())) {
    console.error(`Error: Telemetry file not found at ${telemetryFile}`)
    process.exit(1)
  }

  // Parse output argument
  let outputPath = path.join(path.dirname(telemetryFile), 'out.log')
  const outFlagIndex = args.findIndex(a => a === '-o' || a === '--output')
  if (outFlagIndex !== -1 && args.length > outFlagIndex + 1) {
    outputPath = args[outFlagIndex + 1]
    if (!path.isAbsolute(outputPath)) {
      outputPath = path.resolve(process.cwd(), outputPath)
    }
  }

  console.log(`Reading telemetry from: ${telemetryFile}`)
  console.log(`Writing filtered log to: ${outputPath}`)

  const content = await file.text()
  const items = parseLogContent(content)

  const filteredItems = items.filter(shouldLog).map((item) => {
    const newItem = { ...item }
    delete newItem.hrTime
    delete newItem.hrTimeObserved
    delete newItem.resource
    return parseStringifiedValues(newItem)
  })

  const outputContent = filteredItems.map(item => JSON.stringify(item, null, 2)).join('\n')
  await Bun.write(outputPath, outputContent)

  console.log(`Processed ${items.length} items. Wrote ${filteredItems.length} items to ${outputPath}`)

  // Debug: Print first item structure if no items matched
  if (items.length > 0 && filteredItems.length === 0) {
    console.log('First item structure:', JSON.stringify(items[0], null, 2))
  }
}

function parseLogContent(content: string): any[] {
  content = content.trim()
  if (!content)
    return []

  // Try parsing as a single JSON array
  if (content.startsWith('[') && content.endsWith(']')) {
    try {
      return JSON.parse(content)
    }
    catch {
      // Fallback
    }
  }

  // Try parsing as JSONL (one object per line)
  const lines = content.split('\n').map(l => l.trim()).filter(l => l)
  const jsonlItems: any[] = []
  let isJsonl = true
  for (const line of lines) {
    try {
      jsonlItems.push(JSON.parse(line))
    }
    catch {
      isJsonl = false
      break
    }
  }
  if (isJsonl)
    return jsonlItems

  // Try parsing as concatenated JSON objects (pretty printed or not)
  const items: any[] = []
  let depth = 0
  let start = 0

  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') {
      if (depth === 0)
        start = i
      depth++
    }
    else if (content[i] === '}') {
      depth--
      if (depth === 0) {
        const chunk = content.substring(start, i + 1)
        try {
          items.push(JSON.parse(chunk))
        }
        catch {
          // console.warn('Failed to parse chunk:', chunk.substring(0, 50) + '...');
        }
      }
    }
  }

  return items
}

function shouldLog(json: any): boolean {
  const keysToCheck = [
    'gemini_cli.user_prompt',
    'gemini_cli.api_response',
    'gen_ai.client.inference.operation.details',
    'gemini_cli.tool_call',
    'gemini_cli.config',
    'gemini_cli.model_routing',
  ]

  const hasKey = (obj: any): boolean => {
    if (!obj || typeof obj !== 'object')
      return false

    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (hasKey(item))
          return true
      }
      return false
    }

    if (obj.key && keysToCheck.includes(obj.key)) {
      return true
    }

    for (const key of keysToCheck) {
      if (obj[key] !== undefined)
        return true
    }

    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string' && keysToCheck.includes(obj[key])) {
        return true
      }
    }

    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'object') {
        if (hasKey(obj[key]))
          return true
      }
    }
    return false
  }

  return hasKey(json)
}

function parseStringifiedValues(obj: any): any {
  if (typeof obj === 'string') {
    const trimmed = obj.trim()
    if ((trimmed.startsWith('{') && trimmed.endsWith('}'))
      || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(obj)
        return parseStringifiedValues(parsed)
      }
      catch {
        return obj
      }
    }
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => parseStringifiedValues(item))
  }

  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {}
    for (const key of Object.keys(obj)) {
      newObj[key] = parseStringifiedValues(obj[key])
    }
    return newObj
  }

  return obj
}
