---
name: tdd
description: Apply useful test-driven development to Repofy library behavior and public contracts using TypeScript, Node.js, ESM, and node:test. Use for behavior changes, bug fixes, validation, error handling, and public API work; skip for changes with no meaningful behavioral risk.
---

# Test-driven development for Repofy

Use this skill when changing observable behavior in this Node.js library. First decide whether a test can protect a meaningful behavior or contract; do not add tests just to increase coverage.

## When TDD helps

Use test-first development for new or changed public behavior, bug fixes, input validation, error mapping, pagination, request construction, credential safety, and other logic with meaningful edge cases or regression risk. For a bug, capture the reported failure as a regression test.

Skip TDD for documentation-only changes, formatting, generated files, and mechanical moves or renames that do not change behavior. For a trivial change with no useful assertion, state briefly why a test would add no signal.

## Before implementation

1. Define the behavior and acceptance conditions. For a public API change, establish the caller-facing contract first: supported inputs, outputs, errors, and compatibility expectations. Use `docs/product/mvp.md` and `docs/product/architecture.md`; update the product contract when it changes.
2. Write focused tests from that contract before implementing it. Keep unit tests parallel to the feature under `test/unit/`, as described in the architecture. Name them after the source behavior with `.test.ts`.
3. Use TypeScript, ESM imports, and Node's built-in `node:test` and `node:assert/strict`. Run tests through the existing `npm test` script (`tsx`); do not add a test framework or dependency unless a demonstrated need exceeds these tools. If the current script cannot discover the architecture's test location, make the smallest script correction needed for the feature.
4. Prefer tests at public or feature boundaries. Stub Octokit/transport behavior and use representative fixtures; do not call GitHub in unit tests or require a real token. Live integration tests are optional, explicitly opt-in, and must use a dedicated read-only token.
5. Cover the normal result and only the important boundary/error cases for the contract. Assert observable values and effects, not private helper structure or incidental call order.

## Red, green, refactor

1. Run the focused test before implementation and confirm it fails because the behavior is missing or wrong. A runner startup error is not a red test. Fix test setup or assertions if it fails for another reason.
2. Implement the smallest change that makes the test pass.
3. Run the focused test again, then the relevant broader checks: `npm test`, `npm run typecheck`, and `npm run build` when applicable. If `npm test` fails before executing tests because of an environment or runner startup problem, try the equivalent focused command with Node's test runner and `tsx` (for example, `node --import tsx --test <test-file>`). Report that `npm test` was blocked; count only an actual failing assertion as red and only a passing assertion run as green.
4. Refactor only while the tests remain green. Keep contract changes, tests, and implementation in the same coherent change group.

If neither the configured command nor an equivalent can run, report the exact blocker and do not claim a passing result. Do not weaken or delete a valid test just to make the implementation pass.
