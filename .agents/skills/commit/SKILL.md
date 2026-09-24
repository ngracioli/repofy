---
name: commit
description: Create clear English Conventional Commits and group related changes into coherent commits. Use whenever preparing or making a Git commit.
---

# Commit

Use this skill whenever a task will create one or more Git commits. Follow repository-specific commit rules as well.

## Prepare

1. Inspect `git status` and the complete diff, including staged changes, before deciding what to commit.
2. Separate unrelated work into coherent commit groups. A group should represent one independently understandable change. Keep files that form one logical change together; do not make one commit per file or one broad commit for unrelated changes.
3. Stage only the paths for the current group. Do not use `git add -A` or `git add .` when unrelated or user-owned changes may be present. Review the staged diff before committing.
4. Preserve pre-existing staged changes and never include unrelated user changes. If unrelated paths are already staged, do not run plain `git commit`: stage any new files for the current group, then use `git commit --only -m "..." -- <current-group-paths>` so only those paths are committed. Verify unrelated staged changes remain staged afterward. If an unrelated change overlaps the same path and cannot be separated safely, stop before committing and explain the conflict.

## Message format

Write commit messages in English using Conventional Commits:

`<type>(<optional scope>): <imperative summary>`

Use a useful type such as `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, or `chore`. Keep the summary concise, specific, and in the imperative mood. Add a body only when it clarifies why the change was needed or records important behavior. Do not add assistant, AI, or tool attribution.

Examples:

- `feat(api): add repository lookup`
- `fix(auth): redact tokens from errors`
- `docs: clarify minimum Node.js version`

## Finish

After each commit, inspect the resulting status and commit summary. Continue with the next independent group only when it is part of the user's authorized task. Pushing is a separate action and requires an explicit request.
