#!/usr/bin/env bun
/**
 * Optimize media files for Gemini API processing.
 * Replaces media_optimizer.py using Bun and ffmpeg.
 */

import { spawn } from "bun";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import path from "path";
import fs from "fs/promises";

// Check for ffmpeg
async function checkFfmpeg(): Promise<boolean> {
  try {
    const proc = spawn(["ffmpeg", "-version"], { stdout: "ignore", stderr: "ignore" });
    await proc.exited;
    return proc.exitCode === 0;
  } catch {
    return false;
  }
}

interface MediaInfo {
  size: number;
  duration: number;
  bit_rate: number;
  width?: number;
  height?: number;
  fps?: number;
  sample_rate?: number;
  channels?: number;
}

async function getMediaInfo(filePath: string): Promise<MediaInfo | null> {
  try {
    const proc = spawn([
      "ffprobe",
      "-v", "quiet",
      "-print_format", "json",
      "-show_format",
      "-show_streams",
      filePath
    ], { stdout: "pipe" });

    const output = await new Response(proc.stdout).text();
    await proc.exited;

    if (proc.exitCode !== 0) return null;

    const data = JSON.parse(output);
    const info: MediaInfo = {
      size: parseInt(data.format.size || "0"),
      duration: parseFloat(data.format.duration || "0"),
      bit_rate: parseInt(data.format.bit_rate || "0"),
    };

    for (const stream of data.streams || []) {
      if (stream.codec_type === "video") {
        info.width = stream.width;
        info.height = stream.height;
      } else if (stream.codec_type === "audio") {
        info.sample_rate = parseInt(stream.sample_rate);
        info.channels = stream.channels;
      }
    }

    return info;
  } catch (e) {
    console.error("Error reading media info:", e);
    return null;
  }
}

async function optimizeVideo(
  inputPath: string,
  outputPath: string,
  options: {
    targetSizeMB?: number;
    maxDuration?: number;
    quality?: number;
    resolution?: string;
    verbose?: boolean;
  }
): Promise<boolean> {
  const info = await getMediaInfo(inputPath);
  if (!info) return false;

  if (options.verbose) {
    console.log(`Input: ${path.basename(inputPath)}`);
    console.log(`  Size: ${(info.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`  Duration: ${info.duration.toFixed(2)}s`);
  }

  const cmd = ["ffmpeg", "-i", inputPath, "-y"];

  // Video codec and quality
  cmd.push("-c:v", "libx264", "-crf", (options.quality || 23).toString());

  // Resolution
  if (options.resolution) {
    cmd.push("-vf", `scale=${options.resolution}`);
  } else if (info.width && info.width > 1920) {
    cmd.push("-vf", "scale=1920:-2"); // Max 1080p
  }

  // Audio
  cmd.push("-c:a", "aac", "-b:a", "128k", "-ac", "2");

  // Duration
  if (options.maxDuration && info.duration > options.maxDuration) {
    cmd.push("-t", options.maxDuration.toString());
  }

  // Bitrate calculation for target size
  if (options.targetSizeMB) {
    const targetBits = options.targetSizeMB * 8 * 1024 * 1024;
    const duration = options.maxDuration ? Math.min(info.duration, options.maxDuration) : info.duration;
    const targetBitrate = Math.floor(targetBits / duration);
    const videoBitrate = Math.max(targetBitrate - 128000, 500000); // Subtract audio, min 500k
    cmd.push("-b:v", videoBitrate.toString());
  }

  cmd.push(outputPath);

  if (options.verbose) console.log("Optimizing...");

  const proc = spawn(cmd, {
    stdout: options.verbose ? "inherit" : "ignore",
    stderr: options.verbose ? "inherit" : "ignore"
  });

  await proc.exited;
  return proc.exitCode === 0;
}

async function optimizeAudio(
  inputPath: string,
  outputPath: string,
  options: {
    bitrate?: string;
    sampleRate?: number;
    verbose?: boolean;
  }
): Promise<boolean> {
  const cmd = [
    "ffmpeg", "-i", inputPath, "-y",
    "-c:a", "aac",
    "-b:a", options.bitrate || "64k",
    "-ar", (options.sampleRate || 16000).toString(),
    "-ac", "1",
    outputPath
  ];

  if (options.verbose) console.log("Optimizing audio...");

  const proc = spawn(cmd, {
    stdout: options.verbose ? "inherit" : "ignore",
    stderr: options.verbose ? "inherit" : "ignore"
  });

  await proc.exited;
  return proc.exitCode === 0;
}

async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: {
    maxWidth?: number;
    quality?: number;
    verbose?: boolean;
  }
): Promise<boolean> {
  // Use ffmpeg for image resizing/compression too
  const maxWidth = options.maxWidth || 1920;
  const cmd = ["ffmpeg", "-i", inputPath, "-y"];

  // Scale if needed
  cmd.push("-vf", `scale='min(${maxWidth},iw)':-1`);
  
  // Quality (q:v for jpeg is 1-31 where 1 is best, mapping roughly)
  // For ffmpeg image2 muxer, -q:v 2 is good quality.
  // Mapping 0-100 quality to 31-1
  const q = Math.floor(31 - ((options.quality || 85) * 30 / 100));
  cmd.push("-q:v", q.toString());

  cmd.push(outputPath);

  if (options.verbose) console.log("Optimizing image...");

  const proc = spawn(cmd, {
    stdout: options.verbose ? "inherit" : "ignore",
    stderr: options.verbose ? "inherit" : "ignore"
  });

  await proc.exited;
  return proc.exitCode === 0;
}

async function splitVideo(
  inputPath: string,
  outputDir: string,
  chunkDuration: number,
  verbose: boolean
): Promise<string[]> {
  const info = await getMediaInfo(inputPath);
  if (!info) return [];

  const numChunks = Math.ceil(info.duration / chunkDuration);
  if (numChunks <= 1) return [inputPath];

  await fs.mkdir(outputDir, { recursive: true });
  const outputFiles: string[] = [];

  for (let i = 0; i < numChunks; i++) {
    const startTime = i * chunkDuration;
    const name = path.basename(inputPath, path.extname(inputPath));
    const ext = path.extname(inputPath);
    const outputPath = path.join(outputDir, `${name}_chunk_${i + 1}${ext}`);

    const cmd = [
      "ffmpeg", "-i", inputPath, "-y",
      "-ss", startTime.toString(),
      "-t", chunkDuration.toString(),
      "-c", "copy",
      outputPath
    ];

    if (verbose) console.log(`Creating chunk ${i + 1}/${numChunks}...`);
    
    const proc = spawn(cmd, { stdout: "ignore", stderr: "ignore" });
    await proc.exited;
    
    if (proc.exitCode === 0) outputFiles.push(outputPath);
  }

  return outputFiles;
}

// CLI Configuration
yargs(hideBin(process.argv))
  .command(
    "$0",
    "Optimize media files",
    (yargs) => {
      return yargs
        .option("input", { type: "string", description: "Input file path" })
        .option("input-dir", { type: "string", description: "Input directory" })
        .option("output", { type: "string", description: "Output file path" })
        .option("output-dir", { type: "string", description: "Output directory" })
        .option("target-size", { type: "number", description: "Target size in MB" })
        .option("quality", { type: "number", default: 85, description: "Quality (0-100)" })
        .option("max-width", { type: "number", default: 1920, description: "Max image width" })
        .option("bitrate", { type: "string", default: "64k", description: "Audio bitrate" })
        .option("split", { type: "boolean", description: "Split long videos" })
        .option("chunk-duration", { type: "number", default: 3600, description: "Chunk duration (s)" })
        .option("verbose", { type: "boolean", alias: "v", description: "Verbose output" });
    },
    async (argv) => {
      if (!(await checkFfmpeg())) {
        console.error("Error: ffmpeg is not installed.");
        process.exit(1);
      }

      const verbose = !!argv.verbose;

      // Single file
      if (argv.input) {
        if (!argv.output && !argv.split) {
          console.error("Error: --output required");
          process.exit(1);
        }

        const ext = path.extname(argv.input).toLowerCase();
        
        if (argv.split) {
          const outDir = (argv.outputDir as string) || "./chunks";
          const chunks = await splitVideo(argv.input as string, outDir, argv.chunkDuration as number, verbose);
          console.log(`Created ${chunks.length} chunks in ${outDir}`);
          return;
        }

        await fs.mkdir(path.dirname(argv.output as string), { recursive: true });

        if ([".mp4", ".mov", ".avi", ".webm"].includes(ext)) {
          await optimizeVideo(argv.input as string, argv.output as string, {
            targetSizeMB: argv.targetSize as number,
            quality: argv.quality as number,
            verbose
          });
        } else if ([".mp3", ".wav", ".m4a", ".flac"].includes(ext)) {
          await optimizeAudio(argv.input as string, argv.output as string, {
            bitrate: argv.bitrate as string,
            verbose
          });
        } else if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
          await optimizeImage(argv.input as string, argv.output as string, {
            maxWidth: argv.maxWidth as number,
            quality: argv.quality as number,
            verbose
          });
        }
      }
      
      // Batch (directory)
      if (argv.inputDir) {
        if (!argv.outputDir) {
          console.error("Error: --output-dir required");
          process.exit(1);
        }
        // Implementation for batch dir... (omitted for brevity, similar logic loop)
        console.log("Batch directory processing not fully implemented in this port yet.");
      }
    }
  )
  .parse();
