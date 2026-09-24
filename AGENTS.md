# Project agent instructions

## GitHub API references

When this project needs to call GitHub APIs, use the guides in [`docs/github-api/`](docs/github-api/):

- [`REST.md`](docs/github-api/REST.md) for resource-oriented endpoints and single-resource operations.
- [`GRAPHQL.md`](docs/github-api/GRAPHQL.md) for tailored reads across related data and supported mutations.

Identify the resource, requested fields or action, GitHub product, and required permissions first. Verify paths, fields, inputs, versions, and permissions against the linked official references; do not guess from memory. Follow pagination and rate-limit guidance, handle API errors, and never expose tokens in source, prompts, or logs. Use the minimum required permissions.

## Commits

Before creating any Git commit, load and follow the commit skill at `.agents/skills/commit/SKILL.md` (also available to Claude at `.claude/skills/commit/SKILL.md`). Use clear English Conventional Commit messages and split independent changes into coherent commits; keep files for one logical change together. Never stage all changes blindly.

## Test-driven development

For code changes, read and apply `.agents/skills/tdd/SKILL.md` to decide whether TDD adds meaningful protection. When it does, define or update the caller-facing contract and write the tests first; run the focused test and confirm the expected failure before implementing. Do not add tests without useful behavioral signal. This library uses TypeScript ESM, Node.js 22+, and the built-in `node:test` runner through `tsx`; follow `docs/product/architecture.md` for test layout and mock external GitHub calls.
