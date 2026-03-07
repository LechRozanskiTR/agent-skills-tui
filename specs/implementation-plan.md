# Agent Skills TUI (Node.js + TypeScript) Implementation Plan

## Summary

Implement Agent Skills TUI in Node.js and TypeScript with `Ink + React`, preserving current product behavior:

- Browse skills from local or remote repositories.
- Select skills in a tree interface.
- Refresh source contents manually.
- Hand off install execution to `npx skills add <source> --skill ...`.

This plan is implementation-focused for `agent-skills-tui-ts`.

## Architecture

Use a typical TypeScript CLI layout:

```text
agent-skills-tui-ts/
├─ specs/
│  └─ implementation-plan.md
├─ src/
│  ├─ cli/
│  ├─ ui/
│  ├─ domain/
│  ├─ services/
│  └─ infrastructure/
├─ testdata/
├─ package.json
├─ tsconfig.json
├─ biome.json
└─ .editorconfig
```

Module responsibilities:

- `src/cli/`: command parsing, process lifecycle, bootstrapping the Ink app.
- `src/ui/`: tree rendering, keybindings, search mode, status/footer, preview pane.
- `src/domain/`: pure state transitions (selection, expansion, filtering, dedupe).
- `src/services/`: source resolution, cloning/refresh, discovery, install handoff.
- `src/infrastructure/`: adapters for filesystem, temp paths, and subprocess execution.

## Product Behavior

- Source argument is required as CLI input.
- Installation always targets launch cwd.
- Supported source formats:
  - local filesystem path
  - GitHub shorthand (`owner/repo`)
  - git URL / HTTPS URL
- Startup resolves source and discovers skills once.
- `r` performs manual refresh.
- No automatic watch/poll in v1.

### Source resolution and refresh

- Local: use path directly.
- Remote:
  - normalize into clone URL when needed
  - clone to `$TMPDIR/agent-skills-tui/<repo-name>/`
  - on startup and refresh: remove current checkout and shallow-clone again
- Keep both:
  - `originalSourceArg` (for final `npx skills add`)
  - `resolvedLocalPath` (for discovery)

### Discovery rules

- Skill node: any directory containing `SKILL.md`.
- Stop traversal once `SKILL.md` is found for that subtree.
- Groups are folders with descendant skills.
- Parse frontmatter `name` and `description` from `SKILL.md`.
- Use parsed `name` as install identifier.
- Resolve canonical paths for symlink-safe dedupe.

### Selection and search behavior

- Group states: checked/unchecked/partial.
- Group toggle selects descendant skills.
- During active search, group toggle applies only to visible descendants.
- Search mode (`f`) captures text input and pauses tree navigation.
- Matching is by skill name only in v1.
- While query is active:
  - keep folder-style rendering
  - show matching skill leaves and required ancestors
  - hide unrelated branches
- `enter` in search mode exits input while keeping query active.
- `esc` clears query and exits search mode.

### Layout

- Upper area: tree.
- Bottom fixed-height pane: skill description preview.
- Footer/status line:
  - source
  - target path
  - selected count
  - active query/mode
  - key hints
  - loading/error status

### Install handoff

- Confirm selection on `enter` in navigation mode.
- Build one invocation:
  - `npx skills add <originalSourceArg> --skill <name>...`
- Do not collect `--agent`, `--global`, `--copy`, or `-y` in v1.
- Surface friendly errors for missing `npx`, clone failures, malformed `SKILL.md`, and empty selection.

## Interfaces and Contracts

- `resolveSource(input: string, cwd: string): Promise<ResolvedSource>`
- `syncSource(source: ResolvedSource, mode: "initial" | "refresh"): Promise<LocalCheckout>`
- `discoverSkills(rootPath: string): Promise<SkillTree>`
- `toggleSelection(tree: SkillTree, nodeId: string, visibleNodeIds?: Set<string>): SkillTree`
- `filterTreeBySkillName(tree: SkillTree, query: string): Set<string>`
- `buildInstallCommand(params: InstallParams): BuiltCommand`
- `runInstall(params: InstallParams): Promise<void>`

Core types:

- `ResolvedSource`
- `SkillTree`, `SkillNode`, `SkillMeta`
- `InstallParams`, `BuiltCommand`

## Formatting and Linting

- `.editorconfig` defaults:
  - spaces for indentation
  - `indent_size = 2`
  - UTF-8, LF, trailing whitespace trim, final newline
- Biome is required for both format and lint:
  - double quotes
  - always trailing commas
  - semicolons always
  - recommended lint rules
  - organize imports
- Required scripts:
  - `format`, `lint`, `check`, `typecheck`, `test`

Quality gate:

- `pnpm typecheck && pnpm test && pnpm check`

## Test Plan

- Unit tests:
  - source classification and normalization
  - discovery boundaries and frontmatter parsing
  - selection propagation and dedupe behavior
  - search filtering visibility
- Integration tests:
  - local nested discovery
  - traversal stop at `SKILL.md`
  - refresh remove-and-reclone flow for remote sources
  - install command argument composition
- Failure-path tests:
  - missing `npx`
  - malformed `SKILL.md`
  - empty selection install guard

## Assumptions and Defaults

- Node.js 20+ is available.
- `name` values in `SKILL.md` are unique per source repository.
- Preset creation via symlink management is not implemented in v1.
