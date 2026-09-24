# Usage guide — Repofy (proposal)

> This guide describes the planned MVP API. The package has not been implemented or published yet; names and examples may change during implementation.

## What the library does

Repofy queries the GitHub API and turns responses into simple objects for an application to display. It is read-only and calls GitHub directly.

## Create a token

Create a fine-grained personal access token on GitHub and grant only the read permissions needed for the repositories you want to query. For private repositories, the token must have access to them. Do not use a token with write permission for this purpose.

## Create the client

The consumer passes the token explicitly. Planned usage:

```ts
import { createGitHubClient } from "repofy";

const github = createGitHubClient({ token: process.env.GITHUB_TOKEN! });
```

Keep the token out of source code and do not log it. In the frontend, environment variables included in the bundle are not secret.

## List repositories

```ts
const page = await github.repositories.list({
  visibility: "all",
  sort: "updated",
  direction: "desc",
  pageSize: 30,
});

for (const repo of page.items) {
  console.log(repo.name, repo.description, repo.primaryLanguage, repo.stars, repo.url);
}

const nextPage = await page.next();
if (nextPage) {
  // Display nextPage.items or request another page when needed.
}
```

The first call returns one page. The application requests more pages only when needed, for example, when someone scrolls through a list.

By default, `list()` returns only repositories owned by the authenticated user. Repositories accessible through collaboration or an organization are excluded.

## Fetch details and languages

```ts
const repo = await github.repositories.get("octocat", "hello-world");
const languages = await github.repositories.getLanguages("octocat", "hello-world");

console.log(repo.topics, repo.defaultBranch, repo.isArchived);
console.log(languages); // Example: { TypeScript: 12000, CSS: 2500 }
```

`getLanguages()` is separate from listing to avoid an extra call for every repository.

## Browser use

The SDK does not prevent using a token in the frontend, but anyone using the application can see a token delivered to the browser. This includes tokens placed in the bundle, in public environment variables, or in browser storage. Use a dedicated fine-grained token with minimum read-only access, and consider revoking it when you no longer need it. To avoid exposing a long-lived token, use a backend intermediary or implement OAuth in a future version.

## Errors and limits

Calls can fail because a token is invalid, permissions are missing, a resource is inaccessible, or GitHub rate limits are reached. The application should handle errors and avoid uncontrolled retries. The library should propagate understandable errors without including the token in messages or logs.

## Current scope

The MVP covers repositories. Profile, commit, issue, and write-operation queries are not part of this version.
