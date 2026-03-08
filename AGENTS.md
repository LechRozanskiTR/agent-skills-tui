# AGENTS.md

## UI Rendering Style

- In component return JSX, prefer short-circuit conditional rendering with `&&` for optional UI blocks.
- When the desired pattern is an inline conditional block like:

```tsx
{condition && (
  <SomeComponent />
)}
```

  preserve that pattern exactly unless the user explicitly asks for a different style.

- Do not replace that inline `&&` pattern with:
  - ternary expressions
  - precomputed `content`/`sourceContent` variables
  - helper abstractions
  - alternate "cleaner" patterns chosen by the assistant
- If the user points to an existing code example as the preferred style, treat that exact example as the canonical style for the edit.

## Markdown Workflow

- Always format any changed Markdown files with the `markdown-lint` skill before finishing the task.
