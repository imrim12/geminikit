import * as fs from 'node:fs'
import * as path from 'node:path'

const geminiDir = path.join(process.cwd(), '.gemini')
const manifestPath = path.join(geminiDir, 'manifest.json')

function getFiles(dir: string, baseDir: string): string[] {
  let results: string[] = []
  const list = fs.readdirSync(dir)

  for (const file of list) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath, baseDir))
    }
    else {
      // Exclude the manifest itself and hidden system files if necessary
      if (file !== 'manifest.json' && !file.startsWith('.')) {
        results.push(path.relative(baseDir, filePath).replace(/\\/g, '/'))
      }
    }
  }
  return results
}

console.log('Generating .gemini manifest...')
if (!fs.existsSync(geminiDir)) {
  console.error('.gemini directory not found!')
  process.exit(1)
}

const files = getFiles(geminiDir, geminiDir)
const manifest = {
  version: '1.0.0', // Schema version
  generatedAt: new Date().toISOString(),
  files: files.sort(),
}

await Bun.write(manifestPath, JSON.stringify(manifest, null, 2))
console.log(`Manifest generated at ${manifestPath} with ${files.length} files.`)
