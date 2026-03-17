# Agent Skills TUI (TypeScript)

Terminal UI for browsing and installing skills from a local or remote source repository.

## Install

This tool is distributed through GitHub Releases instead of an npm registry.

### macOS and Linux

Requirements:

- Node.js 20+
- `git` for remote sources
- `npx` for the install handoff

```bash
curl -fsSL https://raw.githubusercontent.com/LechRozanskiTR/agent-skills-tui/main/scripts/install.sh | sh
```

The installer downloads the latest `agent-skills-tui.tar.gz` release asset, installs it to
`~/.local/share/agent-skills-tui`, and links `agent-skills-tui` into `~/.local/bin`.

### Windows

Requirements:

- Node.js 20+
- `git` for remote sources
- `npx` for the install handoff

```powershell
irm https://raw.githubusercontent.com/LechRozanskiTR/agent-skills-tui/main/scripts/install.ps1 | iex
```

The PowerShell installer downloads the latest `agent-skills-tui-windows.zip` release asset,
installs it to `%LOCALAPPDATA%\agent-skills-tui`, and creates wrappers in `%USERPROFILE%\.local\bin`.

### Manual install

If you prefer not to use the installer scripts, download the latest release assets from:

- <https://github.com/LechRozanskiTR/agent-skills-tui/releases/latest>

Use `agent-skills-tui.tar.gz` on macOS/Linux and `agent-skills-tui-windows.zip` on Windows.
After extracting, put the bundled `bin` command on your `PATH`.

### Upgrades

Re-run the relevant installer command to replace an existing installation with the latest release.

To install a specific release instead of the latest one:

- macOS/Linux: set `AGENT_SKILLS_TUI_VERSION=vX.Y.Z` before running `install.sh`
- Windows: pass `-Version vX.Y.Z` to `install.ps1`

## Development Requirements

- Node.js 20+
- pnpm

## Usage

```bash
agent-skills-tui <source>
```

Examples:

```bash
agent-skills-tui ./path/to/skills-repo
agent-skills-tui owner/repo
agent-skills-tui https://github.com/owner/repo.git
```

For local development:

```bash
pnpm install
pnpm dev -- <source>
```

## Keybindings

- `up` / `down`: move
- `pgup` / `pgdn`: jump by one visible page
- `home` / `end`: jump to the first or last visible row
- `left` / `h`: collapse
- `right` / `l`: expand
- `[` / `]`: collapse or expand all groups
- `space`: toggle selection
- `enter`: install selected skills
- `/`: search mode
- `r`: refresh
- `q`: quit

## Quality checks

```bash
pnpm typecheck
pnpm test
pnpm check
pnpm build:release
```
