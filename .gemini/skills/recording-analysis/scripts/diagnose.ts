import { spawn } from 'bun'

async function runCommand(cmd: string[]): Promise<{ exitCode: number, stdout: string }> {
  // Use shell: true for better Windows compatibility if needed, but direct spawn is preferred for tools.
  // For nvidia-smi, it should be in PATH.
  try {
    const proc = spawn(cmd, { stdout: 'pipe', stderr: 'pipe' })
    const text = await new Response(proc.stdout).text()
    const exitCode = await proc.exited
    return { exitCode, stdout: text.trim() }
  }
  catch {
    return { exitCode: -1, stdout: '' }
  }
}

async function main() {
  console.log('Starting environment diagnosis...')

  let hasGpu = false
  let hasCuda = false
  let backend = 'paddle' // Default fallback

  // 1. Check Hardware (nvidia-smi)
  try {
    const { exitCode } = await runCommand(['nvidia-smi'])
    if (exitCode === 0) {
      hasGpu = true
      console.log('✅ GPU Hardware Detected')
    }
    else {
      console.log('⚠️ No GPU Hardware Detected (or nvidia-smi missing).')
    }
  }
  catch {
    console.log('⚠️ nvidia-smi check failed.')
  }

  // 2. Check CUDA/Torch (if GPU found)
  if (hasGpu) {
    console.log('Checking PyTorch CUDA availability...')
    // Using python -c to check torch
    const pythonCmd = 'import torch; print(torch.cuda.is_available())'
    const { stdout, exitCode } = await runCommand(['python', '-c', pythonCmd])

    if (exitCode === 0 && stdout.includes('True')) {
      hasCuda = true
      backend = 'omniparser'
      console.log('✅ CUDA and PyTorch are ready.')
    }
    else {
      console.error('❌ GPU detected but PyTorch cannot access CUDA.')
      await generateCudaGuide()
      console.log('\n[ACTION REQUIRED] Please read \'CUDA_SETUP_GUIDE.md\' to fix your environment.')
      process.exit(1) // Signifies "NEEDS_SETUP"
    }
  }
  else {
    console.log('ℹ️ defaulting to CPU mode (PaddleOCR).')
  }

  // 3. Write Config
  const config = {
    backend,
    hasGpu,
    hasCuda,
    timestamp: new Date().toISOString(),
  }

  await Bun.write('env_config.json', JSON.stringify(config, null, 2))
  console.log(`✅ Diagnosis complete. Config written to env_config.json. Backend: ${backend}`)
}

async function generateCudaGuide() {
  const guide = `# CUDA Setup Guide

It appears you have an NVIDIA GPU, but PyTorch cannot access it. This usually means the CUDA Toolkit is missing or mismatched.

## Quick Fixes

### Windows
1. Install the latest NVIDIA Drivers.
2. Install PyTorch with CUDA support:
   \`\`\`bash
   pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
   \`\`\`

### Linux
1. Install NVIDIA drivers and CUDA toolkit:
   \`\`\`bash
   sudo apt install nvidia-cuda-toolkit
   \`\`\`
2. Reinstall PyTorch (see above).
`
  await Bun.write('CUDA_SETUP_GUIDE.md', guide)
}

main()
