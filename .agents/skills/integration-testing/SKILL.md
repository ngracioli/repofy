---
name: integration-testing
description: Design and run opt-in tests against real external services, using this repository's Node.js test setup and safe credentials.
---

# Integration testing

Use this skill when a test crosses the process boundary to a real service, API, database, or deployed system. Keep ordinary behavior tests in `test/unit/`; do not use live credentials there.

## Before writing a test

1. Read `docs/product/architecture.md`, relevant product contracts, and the official API guide under `docs/github-api/` when testing GitHub.
2. Identify the exact operation and permissions. Use a dedicated, read-only credential with minimum access.
3. Make network tests opt-in. Require both an explicit enable flag and the needed credential; skip otherwise. Keep normal `npm test` independent of external services.
4. Load local values from `.env` via the repository's integration-test script. Keep `.env` ignored and update `.env.example` with variable names and safe empty values only.

## Test design

- Exercise the public client and a small end-to-end path, with assertions stable across accounts and time.
- Prefer read-only requests. Never add writes, destructive cleanup, or broad retries to make a live test pass.
- Do not print credentials, include them in assertion messages, or commit `.env`.
- Keep unit tests mocked and deterministic. Use fixtures for normalization, pagination, and error mapping; integration tests should prove only that the real boundary works.
- Keep live tests short and bounded. Avoid listing or downloading all resources when one item or one page proves the contract.

## Run and report

Run the focused integration test only after confirming opt-in and credential configuration. Report whether it passed, failed, or was skipped, and name the required environment variables without revealing their values. Run the unit suite and relevant static checks separately; a skipped live test is not a passing integration result.

For behavior changes covered by both layers, also follow `.agents/skills/tdd/SKILL.md` for the unit-level contract and red/green loop.
