#!/usr/bin/env bun
import type { PuppeteerLifeCycleEvent, ScreenshotOptions } from 'puppeteer'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { spawnSync } from 'bun'
/**
 * Take a screenshot
 * Usage: bun screenshot.ts --output screenshot.png [--url https://example.com] [--full-page true] [--selector .element] [--max-size 5] [--no-compress]
 */
import { closeBrowser, getBrowser, getPage, outputError, outputJSON, parseArgs } from './lib/browser.js'
import { getElement, parseSelector } from './lib/selector.js'

/**
 * Compress image using ImageMagick if it exceeds max size
 */
async function compressImageIfNeeded(filePath: string, maxSizeMB = 5) {
  const stats = await fs.stat(filePath)
  const originalSize = stats.size
  const maxSizeBytes = maxSizeMB * 1024 * 1024

  if (originalSize <= maxSizeBytes) {
    return { compressed: false, originalSize, finalSize: originalSize }
  }

  try {
    // Check if ImageMagick is available
    try {
      spawnSync(['magick', '-version'])
    }
    catch {
      try {
        spawnSync(['convert', '-version'])
      }
      catch {
        console.error('Warning: ImageMagick not found. Install it to enable automatic compression.')
        return { compressed: false, originalSize, finalSize: originalSize }
      }
    }

    const ext = path.extname(filePath).toLowerCase()
    const tempPath = filePath.replace(ext, `.temp${ext}`)

    // Determine compression strategy based on file type
    let compressionCmd: string[]
    if (ext === '.png') {
      // For PNG: resize and compress with quality
      compressionCmd = ['magick', filePath, '-strip', '-resize', '90%', '-quality', '85', tempPath]
    }
    else if (ext === '.jpg' || ext === '.jpeg') {
      // For JPEG: compress with quality and progressive
      compressionCmd = ['magick', filePath, '-strip', '-quality', '80', '-interlace', 'Plane', tempPath]
    }
    else {
      // For other formats: convert to JPEG with compression
      compressionCmd = ['magick', filePath, '-strip', '-quality', '80', tempPath.replace(ext, '.jpg')]
    }

    // Try compression
    spawnSync(compressionCmd)

    const compressedStats = await fs.stat(tempPath)
    const compressedSize = compressedStats.size

    // If still too large, try more aggressive compression
    if (compressedSize > maxSizeBytes) {
      const finalPath = filePath.replace(ext, `.final${ext}`)
      let aggressiveCmd: string[]

      if (ext === '.png') {
        aggressiveCmd = ['magick', tempPath, '-strip', '-resize', '75%', '-quality', '70', finalPath]
      }
      else {
        aggressiveCmd = ['magick', tempPath, '-strip', '-quality', '60', '-sampling-factor', '4:2:0', finalPath]
      }

      spawnSync(aggressiveCmd)
      await fs.unlink(tempPath)
      await fs.rename(finalPath, filePath)
    }
    else {
      await fs.rename(tempPath, filePath)
    }

    const finalStats = await fs.stat(filePath)
    return { compressed: true, originalSize, finalSize: finalStats.size }
  }
  catch (error: any) {
    console.error('Compression error:', error.message)
    // If compression fails, keep original file
    try {
      const tempPath = filePath.replace(path.extname(filePath), `.temp${path.extname(filePath)}`)
      await fs.unlink(tempPath).catch(() => {})
    }
    catch {}
    return { compressed: false, originalSize, finalSize: originalSize }
  }
}

async function screenshot() {
  const args = parseArgs(process.argv.slice(2))

  if (!args.output || typeof args.output !== 'string') {
    outputError(new Error('--output is required'))
    return
  }

  try {
    const browser = await getBrowser({
      headless: args.headless !== 'false',
    })

    const page = await getPage(browser)

    // Navigate if URL provided
    if (args.url && typeof args.url === 'string') {
      await page.goto(args.url, {
        waitUntil: (args['wait-until'] as PuppeteerLifeCycleEvent) || 'networkidle2',
      })
    }

    const screenshotOptions: ScreenshotOptions = {
      path: args.output,
      type: (args.format as 'png' | 'jpeg' | 'webp') || 'png',
      fullPage: args['full-page'] === 'true',
    }

    if (args.quality) {
      screenshotOptions.quality = Number.parseInt(args.quality as string)
    }

    let buffer
    if (args.selector && typeof args.selector === 'string') {
      // Parse and validate selector
      const parsed = parseSelector(args.selector)

      // Get element based on selector type
      const element = await getElement(page, parsed)
      if (!element) {
        throw new Error(`Element not found: ${args.selector}`)
      }
      buffer = await element.screenshot(screenshotOptions)
    }
    else {
      buffer = await page.screenshot(screenshotOptions)
    }

    const result: any = {
      success: true,
      output: path.resolve(args.output),
      size: buffer.length,
      url: page.url(),
    }

    // Compress image if needed (unless --no-compress flag is set)
    if (args['no-compress'] !== 'true') {
      const maxSize = args['max-size'] ? Number.parseFloat(args['max-size'] as string) : 5
      const compressionResult = await compressImageIfNeeded(args.output, maxSize)

      if (compressionResult.compressed) {
        result.compressed = true
        result.originalSize = compressionResult.originalSize
        result.size = compressionResult.finalSize
        result.compressionRatio = `${((1 - compressionResult.finalSize / compressionResult.originalSize) * 100).toFixed(2)}%`
      }
    }

    outputJSON(result)

    if (args.close !== 'false') {
      await closeBrowser()
    }
  }
  catch (error: any) {
    outputError(error)

    process.exit(1)
  }
}

screenshot()
