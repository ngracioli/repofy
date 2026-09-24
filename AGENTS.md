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

## Code quality

Use Biome as the formatter and linter. Before finishing code changes, run `npm run check` and `npm run typecheck`; use `npm run format` to apply the repository format. CI enforces formatting, lint, typecheck, and build on Node.js 22 and 24. Do not add competing formatter or linter tools without a concrete gap Biome cannot cover.

Review changed algorithms for time and space complexity, especially loops nested inside loops, repeated scans/lookups, and branches that do work on every iteration. Prefer O(1) lookup when it fits the operation; use `Map` or `Set` to avoid repeated linear searches when that improves the actual workload. A full traversal is inherently O(n), and O(1) is not a blanket requirement: preserve correctness and clear code, and do not add caches or indexes without a demonstrated need and safe invalidation. For potentially growing inputs, avoid O(n²) work when a straightforward O(n) approach exists. Biome's cognitive-complexity rule flags deeply nested control flow; it does not prove Big-O performance, so inspect the algorithm itself. Avoid splitting functions or adding abstractions solely to silence a complexity score.
