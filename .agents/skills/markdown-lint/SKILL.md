---
name: markdown-lint
description: "PROACTIVELY run after ANY markdown file edits. Lints and auto-fixes markdown using rumdl. Triggers: after .md changes, 'lint', 'check markdown', 'fix formatting', 'validate'"
model: claude-haiku-4-5-20251001
allowed-tools: [Bash(rumdl:*), Read, Edit]
---

# Markdown Lint

Lint the markdown files that were just changed.

## Steps

1. Run `rumdl check --fix --color never <changed-file(s)>`
   - Exit code 0 = all clean, exit code 1 = issues remain
   - Remaining issues are lines printed WITHOUT `[fixed]` marker
2. If issues remain, manually fix them using Read and Edit tools
3. Briefly report results

## Output Format

Each issue is one line: `{file}:{line}:{column}: [{rule_id}] {message} [{indicator}]`

- `[*]` = fixable issue
- `[fixed]` = was auto-fixed
- No indicator = unfixable, needs manual fix

## Notes

- Only lint the specific files that were modified, not the entire project
- Use haiku model for speed - this is a quick operation
