# Tool Installation Guide

This guide provides instructions for installing the required dependencies for the `media-processing` skill: **Bun**, **FFmpeg**, and **ImageMagick**.

## 1. Bun (Runtime)
The scripts are written in TypeScript and run using the Bun runtime.

### Linux / macOS
```bash
curl -fsSL https://bun.sh/install | bash
# You may need to source your profile or restart the shell
source ~/.bashrc || source ~/.zshrc
```

### Windows (PowerShell)
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

### Verification
```bash
bun --version
```

---

## 2. FFmpeg
Required for all video and audio processing tasks.

### Linux (Debian/Ubuntu)
```bash
sudo apt-get update
sudo apt-get install -y ffmpeg
```

### macOS
```bash
brew install ffmpeg
```

### Windows
```powershell
winget install ffmpeg --accept-package-agreements
# Or download from https://ffmpeg.org/download.html
```

### Verification
```bash
ffmpeg -version
```

---

## 3. ImageMagick
Required for all image processing and resizing tasks.

### Linux (Debian/Ubuntu)
```bash
sudo apt-get update
sudo apt-get install -y imagemagick
```

### macOS
```bash
brew install imagemagick
```

### Windows
```powershell
winget install ImageMagick.ImageMagick --accept-package-agreements
```

### Verification
```bash
magick -version
# Note: Legacy 'convert' command may also be available
```

---

## Troubleshooting

**"bun: command not found"**
- Install Bun using the instructions above.
- Ensure Bun is in your PATH (`export PATH=$HOME/.bun/bin:$PATH`).

**"ffmpeg: command not found"**
- Install FFmpeg.
- If installed but not found, check your PATH.

**"magick: command not found"**
- Install ImageMagick.
- On Linux, try `sudo apt-get install -y imagemagick`.