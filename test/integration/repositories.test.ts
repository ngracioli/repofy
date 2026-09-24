import assert from "node:assert/strict";
import { test } from "node:test";
import { createGitHubClient } from "../../src/index.js";

test("lists repositories using the configured GitHub token", {
  skip:
    process.env.RUN_GITHUB_INTEGRATION_TESTS !== "true" ||
    !process.env.GITHUB_TOKEN,
}, async () => {
  const client = createGitHubClient({
    token: process.env.GITHUB_TOKEN as string,
  });
  const page = await client.repositories.list({ pageSize: 1 });
  assert.ok(Array.isArray(page.items));
});
