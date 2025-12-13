import * as fs from 'node:fs'
import * as path from 'node:path'

interface Manifest {
  version: string
  generatedAt: string
  files: string[]
}

export async function runUpdate() {
  console.log('[GeminiKit] Starting update...')

  // 1. Locate source .gemini directory (New Version)
  let sourceDir = ''
  const possiblePaths = [
    path.join(process.cwd(), 'node_modules', 'geminikit', '.gemini'), // Consumer project
    path.resolve(__dirname, '..', '..', '..', '.gemini'), // Monorepo dev
  ]

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      sourceDir = p
      break
    }
  }

  if (!sourceDir) {
    console.error('[GeminiKit] Error: Could not find source .gemini folder. Ensure "geminikit" is installed.')
    return
  }

  // 2. Locate destination .gemini directory (Current Project)
  const destDir = path.join(process.cwd(), '.gemini')
  if (!fs.existsSync(destDir)) {
    console.error('[GeminiKit] Error: Destination .gemini folder not found. Please run "gk setup" first.')
    return
  }

  // 3. Read Manifests
  const sourceManifestPath = path.join(sourceDir, 'manifest.json')
  const destManifestPath = path.join(destDir, 'manifest.json')

  if (!fs.existsSync(sourceManifestPath)) {
    console.error('[GeminiKit] Error: Source manifest not found. The installed geminikit version might be corrupted or too old.')
    return
  }

  let sourceManifest: Manifest
  try {
    const content = await Bun.file(sourceManifestPath).text()
    sourceManifest = JSON.parse(content)
  }
  catch {
    console.error('[GeminiKit] Error: Failed to parse source manifest.')
    return
  }

  let destManifest: Manifest | null = null
  if (fs.existsSync(destManifestPath)) {
    try {
      const content = await Bun.file(destManifestPath).text()
      destManifest = JSON.parse(content)
    }
    catch {
      console.warn('[GeminiKit] Warning: Failed to parse destination manifest. Treating as fresh update.')
    }
  }

  // 4. Perform Update
  const newFiles = new Set(sourceManifest.files)
  const oldFiles = new Set(destManifest ? destManifest.files : [])

  // 4a. Add / Overwrite
  let addedCount = 0
  let updatedCount = 0

  for (const file of newFiles) {
    const srcFile = path.join(sourceDir, file)
    const destFile = path.join(destDir, file)

    const destDirName = path.dirname(destFile)
    if (!fs.existsSync(destDirName)) {
      fs.mkdirSync(destDirName, { recursive: true })
    }

    if (!fs.existsSync(destFile)) {
      // Add
      await safeCopyFile(srcFile, destFile)
      addedCount++
    }
    else {
      // Update (Overwrite)
      await safeCopyFile(srcFile, destFile)
      updatedCount++
    }
  }

  // 4b. Delete
  // Only delete files that were in the OLD manifest but are NOT in the NEW manifest.
  let deletedCount = 0
  if (destManifest) {
    for (const file of oldFiles) {
      if (!newFiles.has(file)) {
        const destFile = path.join(destDir, file)
        if (fs.existsSync(destFile)) {
          try {
            fs.unlinkSync(destFile)
            deletedCount++
          }
          catch (e) {
            console.error(`[GeminiKit] Failed to delete ${file}:`, e)
          }

          // Clean up empty directories if needed
          const dir = path.dirname(destFile)
          try {
            if (fs.readdirSync(dir).length === 0) {
              fs.rmdirSync(dir)
            }
          }
          catch {
            // Ignore
          }
        }
      }
    }
  }

  // 5. Update Manifest at Destination
  await safeCopyFile(sourceManifestPath, destManifestPath)

  console.log(`[GeminiKit] Update complete!`)
  console.log(`  Added:   ${addedCount}`)
  console.log(`  Updated: ${updatedCount}`)
  console.log(`  Deleted: ${deletedCount}`)
}

async function safeCopyFile(src: string, dest: string) {
  try {
    if (fs.existsSync(dest)) {
      fs.unlinkSync(dest) // Break hard link / remove existing
    }
    await Bun.write(dest, Bun.file(src))
  }
  catch (e: any) {
    console.error(`[GeminiKit] Error copying ${path.basename(src)}: ${e.message}`)
  }
}
