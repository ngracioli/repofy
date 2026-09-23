# Project agent instructions

## GitHub API references

When this project needs to call GitHub APIs, use the guides in [`docs/github-api/`](docs/github-api/):

- [`REST.md`](docs/github-api/REST.md) for resource-oriented endpoints and single-resource operations.
- [`GRAPHQL.md`](docs/github-api/GRAPHQL.md) for tailored reads across related data and supported mutations.

Identify the resource, requested fields or action, GitHub product, and required permissions first. Verify paths, fields, inputs, versions, and permissions against the linked official references; do not guess from memory. Follow pagination and rate-limit guidance, handle API errors, and never expose tokens in source, prompts, or logs. Use the minimum required permissions.
