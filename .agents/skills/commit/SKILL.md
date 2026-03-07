---
name: commit
description: >-
  Stage all changes and create or amend conventional commits. Use when asked to
  commit work, amend a commit, prepare a commit after implementation, or
  summarize committed changes. Trigger phrases: commit changes; amend commit;
  stage all changes; conventional commit; git add all.
license: Apache-2.0
compatibility: Requires git in a local repository.
argument-hint: "[conventional-message]"
allowed-tools: Read Bash(git status:*) Bash(git add -A:*) Bash(git commit:*) Bash(git log:*)
---

# Commit

## Purpose

Stage the full worktree with `git add -A` and create or amend a conventional
commit, unless the user explicitly requests committing only specific files.
When the user asks to commit without narrowing scope, treat that as consent to
include every current worktree change.

## Inputs

### Required

- `worktree_state`: the current repository state to be committed

### Optional

- `conventional_message`: the intended conventional commit message
- `change_summary`: a short summary to turn into a conventional commit message when one is not provided
- `staging_scope`: specific files or paths to stage when the user explicitly requests a partial commit

## Outputs

- A commit or amended commit
- The final commit hash and a short summary of what was included

## Critical Rules

- Stage with `git add -A` by default
- Always include untracked files
- Do not stop or narrow the commit because some changes were unexpected,
  unrelated, or user-authored when the user asked for the default full-worktree
  commit
- Only use partial staging when the user explicitly asks to commit only specific files or paths
- Always use conventional commit messages
- Amend only when the user explicitly asks

## Workflow

1. Review `worktree_state` so the commit contents are understood before staging.
2. If the user did not request partial staging, proceed with the default
   full-worktree commit even when the worktree contains unrelated or unexpected
   changes.
3. Stage everything with `git add -A` unless the user explicitly asked for a
   partial commit, in which case stage only the requested files or paths.
4. Create or amend the commit using `conventional_message` when provided;
   otherwise derive a conventional message from `change_summary` in the form
   `type(scope): summary` or `type: summary`.
5. Summarize the committed contents and provide the resulting commit hash.

## Completion Criteria

- The correct staging scope was used: full worktree by default, or only the user-requested files for an explicit partial commit
- A default commit request included all current worktree changes without
  pausing over unrelated modifications
- The commit message uses a conventional format
- The user receives the resulting commit hash and a concise content summary
