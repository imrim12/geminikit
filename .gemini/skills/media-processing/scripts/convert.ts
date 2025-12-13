#!/usr/bin/env bun
/**
 * Unified media conversion tool for video, audio, and images.
 * Replaces media_convert.py
 */

import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { checkDependencies, runCommand } from './lib/utils.js'

// Configuration
const VIDEO_FORMATS = new Set(['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv', '.m4v'])
const AUDIO_FORMATS = new Set(['.mp3', '.aac', '.m4a', '.opus', '.flac', '.wav', '.ogg'])
const IMAGE_FORMATS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif'])

const QUALITY_PRESETS: Record<string, any> = {
  web: {
    video_crf: 23,
    video_preset: 'medium',
    audio_bitrate: '128k',
    image_quality: 85,
  },
  archive: {
    video_crf: 18,
    video_preset: 'slow',
    audio_bitrate: '192k',
    image_quality: 95,
  },
  mobile: {
    video_crf: 26,
    video_preset: 'fast',
    audio_bitrate: '96k',
    image_quality: 80,
  },
}

function detectMediaType(filePath: string): 'video' | 'audio' | 'image' | 'unknown' {
  const ext = path.extname(filePath).toLowerCase()
  if (VIDEO_FORMATS.has(ext))
    return 'video'
  if (AUDIO_FORMATS.has(ext))
    return 'audio'
  if (IMAGE_FORMATS.has(ext))
    return 'image'
  return 'unknown'
}

function buildVideoCommand(inputPath: string, outputPath: string, presetName: string): string[] {
  const quality = QUALITY_PRESETS[presetName]
  return [
    'ffmpeg',
    '-i',
    inputPath,
    '-c:v',
    'libx264',
    '-preset',
    quality.video_preset,
    '-crf',
    quality.video_crf.toString(),
    '-c:a',
    'aac',
    '-b:a',
    quality.audio_bitrate,
    '-movflags',
    '+faststart',
    '-y',
    outputPath,
  ]
}

function buildAudioCommand(inputPath: string, outputPath: string, presetName: string): string[] {
  const quality = QUALITY_PRESETS[presetName]
  const outputExt = path.extname(outputPath).toLowerCase()

  const codecMap: Record<string, string> = {
    '.mp3': 'libmp3lame',
    '.aac': 'aac',
    '.m4a': 'aac',
    '.opus': 'libopus',
    '.flac': 'flac',
    '.wav': 'pcm_s16le',
    '.ogg': 'libvorbis',
  }

  const codec = codecMap[outputExt] || 'aac'
  const cmd = ['ffmpeg', '-i', inputPath, '-c:a', codec]

  if (!['flac', 'pcm_s16le'].includes(codec)) {
    cmd.push('-b:a', quality.audio_bitrate)
  }

  cmd.push('-y', outputPath)
  return cmd
}

function buildImageCommand(inputPath: string, outputPath: string, presetName: string): string[] {
  const quality = QUALITY_PRESETS[presetName]
  return [
    'magick',
    inputPath,
    '-quality',
    quality.image_quality.toString(),
    '-strip',
    outputPath,
  ]
}

async function convertFile(
  inputPath: string,
  outputPath: string,
  options: { preset: string, dryRun: boolean, verbose: boolean },
): Promise<boolean> {
  const mediaType = detectMediaType(inputPath)

  if (mediaType === 'unknown') {
    console.error(`Error: Unsupported format for ${inputPath}`)
    return false
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true })

  let cmd: string[]
  if (mediaType === 'video') {
    cmd = buildVideoCommand(inputPath, outputPath, options.preset)
  }
  else if (mediaType === 'audio') {
    cmd = buildAudioCommand(inputPath, outputPath, options.preset)
  }
  else {
    cmd = buildImageCommand(inputPath, outputPath, options.preset)
  }

  return runCommand(cmd, options.verbose, options.dryRun)
}

// CLI
yargs(hideBin(process.argv))
  .command(
    '$0',
    'Unified media conversion tool',
    (yargs) => {
      return yargs
        .option('input', { array: true, type: 'string', demandOption: true, description: 'Input file(s)' })
        .option('output', { type: 'string', description: 'Output file or directory' })
        .option('format', { type: 'string', description: 'Output format extension (e.g., mp4)' })
        .option('preset', { choices: ['web', 'archive', 'mobile'], default: 'web', description: 'Quality preset' })
        .option('dry-run', { type: 'boolean', alias: 'n', description: 'Dry run' })
        .option('verbose', { type: 'boolean', alias: 'v', description: 'Verbose output' })
    },
    async (argv) => {
      const { ffmpeg, magick } = await checkDependencies()
      if (!ffmpeg && !magick) {
        console.error('Error: Neither ffmpeg nor imagemagick found.')
        process.exit(1)
      }

      const inputs = argv.input as string[]
      const outputArg = argv.output as string | undefined
      const format = argv.format as string | undefined

      // Single file case
      if (inputs.length === 1 && outputArg && !format && path.extname(outputArg)) {
        const success = await convertFile(inputs[0], outputArg, {
          preset: argv.preset,
          dryRun: !!argv.dryRun,
          verbose: !!argv.verbose,
        })
        process.exit(success ? 0 : 1)
      }

      // Batch case
      let successCount = 0
      let failCount = 0
      const outputDir = (outputArg && !path.extname(outputArg)) ? outputArg : '.'

      for (const input of inputs) {
        try {
          await fs.access(input)
        }
        catch {
          console.error(`Error: File not found ${input}`)
          failCount++
          continue
        }

        let outputPath: string
        const name = path.basename(input, path.extname(input))

        if (format) {
          outputPath = path.join(outputDir, `${name}.${format.replace(/^\./, '')}`)
        }
        else if (outputArg && path.extname(outputArg)) {
          // Should not happen in batch loop usually unless misconfigured
          outputPath = outputArg
        }
        else {
          // Fallback: replace extension in place if possible, but safer to require format or output dir
          // Logic mirrors python: if no format specified, fail?
          // Python script fails if no output format specified in batch mode.
          // We will try to infer from input if just optimizing, but usually conversion implies format change.
          // If media type is same, just optimize.
          console.error(`Error: Output format not specified for batch conversion of ${input}`)
          failCount++
          continue
        }

        console.log(`Converting ${path.basename(input)} -> ${path.basename(outputPath)}`)
        const success = await convertFile(input, outputPath, {
          preset: argv.preset,
          dryRun: !!argv.dryRun,
          verbose: !!argv.verbose,
        })

        if (success)
          successCount++
        else failCount++
      }

      console.log(`\nResults: ${successCount} succeeded, ${failCount} failed`)
      process.exit(failCount === 0 ? 0 : 1)
    },
  )
  .parse()
