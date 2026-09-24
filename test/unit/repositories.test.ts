import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createGitHubClient, GitHubApiError } from "../../src/index.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("lists owned repositories one page at a time and normalizes them", async () => {
  const requests: Array<{ url: URL; authorization: string | null }> = [];
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    requests.push({
      url,
      authorization: new Headers(init?.headers).get("authorization"),
    });
    const page = url.searchParams.get("page") ?? "1";
    return new Response(
      JSON.stringify([
        {
          id: 7,
          name: `repo-${page}`,
          full_name: `alice/repo-${page}`,
          description: null,
          html_url: "https://github.com/alice/repo",
          homepage: null,
          language: "TypeScript",
          stargazers_count: 4,
          forks_count: 2,
          visibility: "public",
          fork: false,
          archived: false,
          default_branch: "main",
          topics: [],
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-02T00:00:00Z",
          pushed_at: "2024-01-03T00:00:00Z",
        },
      ]),
      {
        status: 200,
        headers:
          page === "1"
            ? {
                "content-type": "application/json",
                link: '<https://api.github.com/user/repos?per_page=30&page=2>; rel="next"',
              }
            : { "content-type": "application/json" },
      },
    );
  };

  const client = createGitHubClient({ token: "test-token" });
  const first = await client.repositories.list({
    visibility: "all",
    pageSize: 30,
  });
  assert.equal(requests.length, 1);
  assert.deepEqual(first.items[0], {
    id: 7,
    name: "repo-1",
    fullName: "alice/repo-1",
    description: null,
    url: "https://github.com/alice/repo",
    homepageUrl: null,
    primaryLanguage: "TypeScript",
    stars: 4,
    forks: 2,
    visibility: "public",
    isFork: false,
    isArchived: false,
    defaultBranch: "main",
    topics: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    pushedAt: "2024-01-03T00:00:00Z",
  });
  assert.equal(requests[0].authorization, "token test-token");
  assert.equal(requests[0].url.searchParams.get("affiliation"), "owner");
  assert.equal(requests[0].url.searchParams.get("visibility"), "all");
  assert.equal(requests[0].url.searchParams.get("per_page"), "30");

  const second = await first.next();
  assert.equal(requests.length, 2);
  assert.equal(second?.items[0].name, "repo-2");
  assert.equal(await second?.next(), undefined);
});

test("rejects invalid page sizes", async () => {
  const client = createGitHubClient({ token: "test-token" });
  await assert.rejects(client.repositories.list({ pageSize: 101 }), RangeError);
});

test("maps GitHub failures to safe public errors", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: "Bad credentials" }), {
      status: 401,
      headers: {
        "content-type": "application/json",
        "x-github-request-id": "request-123",
      },
    });
  const token = "do-not-leak";
  const client = createGitHubClient({ token });
  await assert.rejects(client.repositories.list(), (error: unknown) => {
    assert.ok(error instanceof GitHubApiError);
    assert.equal(error.status, 401);
    assert.equal(error.requestId, "request-123");
    assert.equal(JSON.stringify(error).includes(token), false);
    assert.equal(error.message.includes(token), false);
    return true;
  });
});
