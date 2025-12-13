#!/usr/bin/env bun
/**
 * Video size optimization with quality/size balance.
 * Replaces video_optimize.py
 */

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import path from "path";
import fs from "fs/promises";
import { spawn } from "bun";
import { checkCommand, runCommand } from "./lib/utils.js";

interface VideoInfo {
  path: string;
  duration: number;
  width: number;
  height: number;
  bitrate: number;
  fps: number;
  size: number;
  codec: string;
  audioCodec: string;
  audioBitrate: number;
}

async function getVideoInfo(filePath: string): Promise<VideoInfo | null> {
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
    
    let videoStream = null;
    let audioStream = null;

    for (const stream of data.streams || []) {
      if (stream.codec_type === "video" && !videoStream) videoStream = stream;
      if (stream.codec_type === "audio" && !audioStream) audioStream = stream;
    }

    if (!videoStream) return null;

    const fpsParts = (videoStream.r_frame_rate || "0/1").split("/");
    const fps = fpsParts.length === 2 ? parseInt(fpsParts[0]) / parseInt(fpsParts[1]) : 0;

    return {
      path: filePath,
      duration: parseFloat(data.format.duration || "0"),
      width: parseInt(videoStream.width || "0"),
      height: parseInt(videoStream.height || "0"),
      bitrate: parseInt(data.format.bit_rate || "0"),
      fps,
      size: parseInt(data.format.size || "0"),
      codec: videoStream.codec_name || "unknown",
      audioCodec: audioStream?.codec_name || "none",
      audioBitrate: parseInt(audioStream?.bit_rate || "0")
    };
  } catch (e) {
    return null;
  }
}

function calculateTargetResolution(
  width: number,
  height: number,
  maxWidth?: number,
  maxHeight?: number
): [number, number] {
  if (!maxWidth && !maxHeight) return [width, height];

  const aspectRatio = width / height;
  let newWidth = width;
  let newHeight = height;

  if (maxWidth && maxHeight) {
    if (width > maxWidth || height > maxHeight) {
      if (width / maxWidth > height / maxHeight) {
        newWidth = maxWidth;
        newHeight = Math.round(maxWidth / aspectRatio);
      } else {
        newHeight = maxHeight;
        newWidth = Math.round(maxHeight * aspectRatio);
      }
    }
  } else if (maxWidth) {
    newWidth = Math.min(width, maxWidth);
    newHeight = Math.round(newWidth / aspectRatio);
  } else if (maxHeight) {
    newHeight = Math.min(height, maxHeight);
    newWidth = Math.round(newHeight * aspectRatio);
  }

  // Ensure even dimensions
  newWidth = newWidth - (newWidth % 2);
  newHeight = newHeight - (newHeight % 2);

  return [newWidth, newHeight];
}

async function optimizeVideo(
  inputPath: string,
  outputPath: string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    targetFps?: number;
    crf: number;
    audioBitrate: string;
    preset: string;
    twoPass: boolean;
    verbose: boolean;
    dryRun: boolean;
  }
): Promise<boolean> {
  const info = await getVideoInfo(inputPath);
  if (!info) {
    console.error(`Error: Could not read video info for ${inputPath}`);
    return false;
  }

  if (options.verbose) {
    console.log("\nInput video info:");
    console.log(`  Resolution: ${info.width}x${info.height}`);
    console.log(`  FPS: ${info.fps.toFixed(2)}`);
    console.log(`  Bitrate: ${(info.bitrate / 1000).toFixed(0)} kbps`);
    console.log(`  Size: ${(info.size / (1024 * 1024)).toFixed(2)} MB`);
  }

  const [targetWidth, targetHeight] = calculateTargetResolution(
    info.width,
    info.height,
    options.maxWidth,
    options.maxHeight
  );

  const cmd = ["ffmpeg", "-i", inputPath];
  const filters: string[] = [];

  if (targetWidth !== info.width || targetHeight !== info.height) {
    filters.push(`scale=${targetWidth}:${targetHeight}`);
  }

  if (filters.length > 0) {
    cmd.push("-vf", filters.join(","));
  }

  if (options.targetFps && options.targetFps < info.fps) {
    cmd.push("-r", options.targetFps.toString());
  }

  // Encoding
  if (options.twoPass) {
    const targetBitrate = Math.floor(info.bitrate * 0.7); // 30% reduction assumption
    
    // Pass 1
    const pass1Cmd = [...cmd,
      "-c:v", "libx264",
      "-preset", options.preset,
      "-b:v", targetBitrate.toString(),
      "-pass", "1",
      "-an",
      "-f", "null",
      process.platform === "win32" ? "NUL" : "/dev/null"
    ];
    
    if (options.verbose || options.dryRun) console.log("Pass 1...");
    if (!options.dryRun) {
      const p1Success = await runCommand(pass1Cmd, options.verbose, false);
      if (!p1Success) return false;
    }

    // Pass 2
    cmd.push(
      "-c:v", "libx264",
      "-preset", options.preset,
      "-b:v", targetBitrate.toString(),
      "-pass", "2"
    );
  } else {
    cmd.push(
      "-c:v", "libx264",
      "-preset", options.preset,
      "-crf", options.crf.toString()
    );
  }

  cmd.push(
    "-c:a", "aac",
    "-b:a", options.audioBitrate,
    "-movflags", "+faststart",
    "-y",
    outputPath
  );

  const success = await runCommand(cmd, options.verbose, options.dryRun);

  if (success && !options.dryRun && options.verbose) {
    const outInfo = await getVideoInfo(outputPath);
    if (outInfo) {
      console.log("\nOutput video info:");
      console.log(`  Resolution: ${outInfo.width}x${outInfo.height}`);
      console.log(`  Size: ${(outInfo.size / (1024 * 1024)).toFixed(2)} MB`);
      const reduction = (1 - outInfo.size / info.size) * 100;
      console.log(`  Size reduction: ${reduction.toFixed(1)}%`);
    }
  }

  // Cleanup logs
  if (options.twoPass && !options.dryRun) {
    const logs = await fs.readdir(".");
    for (const f of logs) {
      if (f.startsWith("ffmpeg2pass") && (f.endsWith(".log") || f.endsWith(".mbtree"))) {
        await fs.unlink(f).catch(() => {});
      }
    }
  }

  return success;
}

yargs(hideBin(process.argv))
  .command(
    "$0",
    "Video optimization tool",
    (yargs) => {
      return yargs
        .option("input", { type: "string", demandOption: true, description: "Input video" })
        .option("output", { type: "string", demandOption: true, description: "Output video" })
        .option("max-width", { type: "number", description: "Max width" })
        .option("max-height", { type: "number", description: "Max height" })
        .option("fps", { type: "number", description: "Target FPS" })
        .option("crf", { type: "number", default: 23, description: "CRF (18-28)" })
        .option("audio-bitrate", { type: "string", default: "128k", description: "Audio bitrate" })
        .option("preset", { type: "string", default: "medium", description: "Encoder preset" })
        .option("two-pass", { type: "boolean", description: "Use two-pass encoding" })
        .option("verbose", { type: "boolean", alias: "v" })
        .option("dry-run", { type: "boolean", alias: "n" });
    },
    async (argv) => {
      if (!(await checkCommand("ffmpeg"))) {
        console.error("Error: ffmpeg not found.");
        process.exit(1);
      }

      const success = await optimizeVideo(
        argv.input,
        argv.output,
        {
          maxWidth: argv.maxWidth,
          maxHeight: argv.maxHeight,
          targetFps: argv.fps,
          crf: argv.crf,
          audioBitrate: argv.audioBitrate,
          preset: argv.preset,
          twoPass: !!argv.twoPass,
          verbose: !!argv.verbose,
          dryRun: !!argv.dryRun
        }
      );

      process.exit(success ? 0 : 1);
    }
  )
  .parse();
