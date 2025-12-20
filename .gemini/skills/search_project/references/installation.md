# Installing Ripgrep (rg)

This skill relies on `ripgrep` for high-performance searching. Please install it for your OS.

## Windows

**Via Winget (Recommended):**
```powershell
winget install BurntSushi.ripgrep.MSVC
```

**Via Chocolatey:**
```powershell
choco install ripgrep
```

**Via Scoop:**
```powershell
scoop install ripgrep
```

## macOS

**Via Homebrew:**
```bash
brew install ripgrep
```

## Linux

**Debian/Ubuntu:**
```bash
sudo apt-get install ripgrep
```

**Arch Linux:**
```bash
sudo pacman -S ripgrep
```

## Cargo (Cross-platform)

If you have Rust installed:
```bash
cargo install ripgrep
```
