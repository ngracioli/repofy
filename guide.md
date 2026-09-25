# Repofy usage guide

Repofy is a read-only TypeScript library for listing repositories owned by the authenticated GitHub user.

## Create a client

Create a fine-grained personal access token with read-only repository metadata access, then pass it to the client:

```ts
import { createGitHubClient } from "repofy";

const github = createGitHubClient({ token: process.env.GITHUB_TOKEN! });
```

Keep the token out of source code and logs. A token used in a browser is visible to people using that application.

## List repositories

Choose one of the three methods:

```ts
const all = await github.repositories.listAll({ pageSize: 30 });
const publicRepositories = await github.repositories.listPublic();
const privateRepositories = await github.repositories.listPrivate();
```

All methods return only repositories owned by the authenticated user and visible to the token. They exclude repositories available only through collaboration or organization membership. Each call returns one page; call `next()` to request the next page only when needed.

The optional `sort`, `direction`, and `pageSize` options apply to all three methods. `pageSize` defaults to 30 and must be between 1 and 100.

Each item is a normalized `Repository` with `id`, `name`, `fullName`, `description`, `url`, `homepageUrl`, `primaryLanguage`, `stars`, `forks`, `visibility`, `isFork`, `isArchived`, `defaultBranch`, `topics`, `createdAt`, `updatedAt`, and `pushedAt`.

```ts
for (const repository of all.items) {
  console.log(repository.name, repository.primaryLanguage, repository.stars);
}

const nextPage = await all.next(); // undefined when there is no next page
```

## Errors

GitHub failures are exposed as `GitHubApiError`, with a safe `message` and optional `status` and `requestId`. The library does not include the token in the error.

## Current scope

Repository listing is currently implemented. Repository details (`get`) and language breakdown (`getLanguages`) are not yet available.
