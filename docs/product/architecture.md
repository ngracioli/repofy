# Repofy Architecture

## Purpose and scope

Repofy is a read-only TypeScript package for Node.js applications. It provides a small, stable interface for reading repositories owned by the authenticated GitHub user. It calls GitHub directly; it does not operate a Repofy server or store credentials.

This document describes the MVP architecture. It does not design OAuth, write operations, framework adapters, persistent caching, or support for other languages.

## Design goals

- Hide REST and GraphQL details behind methods named for the data consumers need.
- Return normalized types instead of making GitHub response JSON the public contract.
- Fetch only requested data, and paginate only when the caller asks for another page.
- Keep permissions read-only and the token under the consumer's control.
- Keep the package small enough that its public API and failure behavior are easy to understand.

## System shape

```text
Consumer application
  └─ createGitHubClient({ token })
       └─ public repositories methods
            ├─ list()         → REST, owner-filtered, paged
            ├─ get()          → GraphQL, selected fields
            └─ getLanguages() → REST
                 └─ one configured Octokit client
                      └─ GitHub API
```

The library owns endpoint selection, pagination mechanics, response normalization, and safe error mapping. The application owns the token's lifecycle, when to fetch another page, how to display results, and any application-level caching. Use one configured Octokit instance for REST, GraphQL, and its pagination plugin; keep endpoint-specific choices inside repository operations rather than maintaining parallel transport clients.

## Public API

Keep the entry point small. Export the client constructor, public data types, and documented errors from `src/index.ts`; do not export Octokit, query strings, endpoint response types, or internal helpers.

```ts
const github = createGitHubClient({ token });

const page = await github.repositories.list({
  visibility: "all",
  sort: "updated",
  direction: "desc",
  pageSize: 30,
});

for (const repository of page.items) {
  console.log(repository.name, repository.primaryLanguage, repository.stars);
}

const nextPage = await page.next(); // undefined when there is no next page
```

Each list call returns one page. `next()` performs at most one additional request and returns the next page or `undefined`; it does not prefetch. Do not expose `hasNextPage`: the REST Link header already drives the private iterator state, and learning whether a next page exists must not trigger a speculative request. This method is the stable public contract for pagination.

`repositories.list()` defaults to repositories owned by the authenticated user. It must not silently include repositories available only through collaboration or organization membership. `repositories.get(owner, name)` may read a repository the token can access, consistent with the MVP. `getLanguages()` stays separate so listing many repositories does not trigger one request per item.

Keep option names and normalized fields documented in `mvp.md`. Validate caller-controlled values such as `pageSize` at the public boundary, with a supported range no larger than GitHub's page maximum. Do not pass arbitrary REST parameters or GraphQL query text through the public API.

## Internal modules

### Directory layout

Organize the package so new GitHub data domains can grow independently. The tree below is the target shape, not a requirement to create empty files and folders on day one. Add a directory when its first real implementation lands.

```text
repofy/
  src/
    index.ts                     Public exports
    client.ts                    Client construction and feature wiring
    errors/
      index.ts                   Public error exports
      github-api-error.ts         Safe GitHub API error
    github/
      pagination.ts              Shared pagination mechanics
    features/
      repositories/
        index.ts                 Public repository methods/types for this feature
        list-repositories.ts     Repository listing
        get-repository.ts        Repository details
        get-languages.ts         Repository language distribution
        map-repository.ts        GitHub response to normalized type
        types.ts                 Repository-specific types
      profile/                    Add when profile methods are implemented
      commits/                    Add when commit methods are implemented
    shared/
      types.ts                   Small types genuinely shared by features
  test/
    unit/
      features/
        repositories.test.ts     Contract tests through the public client
      github/
        pagination.test.ts       Only if pagination behavior needs an isolated test
    integration/
      repositories.test.ts       Optional live GitHub tests, opt-in only
  docs/
    github-api/
    product/
  .github/
    workflows/                   Add CI workflows as needed
  .changeset/                    Add only if adopting Changesets for releases
  package.json
  tsconfig.json
  tsconfig.build.json            Add if build and test compilation need different settings
  README.md
  LICENSE
  CHANGELOG.md                   Add when releases begin
```

`features/` groups code by user-facing GitHub domain; each feature owns its operations, mapping, and domain types. `github/` contains only shared transport concerns such as pagination. The Octokit instance is configured once in `client.ts`; REST and GraphQL are methods on that same instance, not separate wrappers. This keeps GitHub-specific HTTP details out of the public feature contract without adding a generic adapter layer. `shared/` is for code used by at least two features, not a default dumping ground.

Keep tests parallel to implementation at the feature boundary. Unit tests use mocked responses and need no token; integration tests must be opt-in and use a dedicated read-only token. Do not make CI depend on a user's personal GitHub credentials. Generated `dist/` should normally stay out of source control. Keep API references in `docs/github-api/` and product decisions in `docs/product/`; do not duplicate them in source comments.

### Module responsibilities and growth rules

- `index.ts` exports only the supported public API.
- `client.ts` creates one configured Octokit instance and exposes implemented feature groups on the returned client.
- `features/repositories/` owns repository operations, normalized repository types, and response mapping.
- `github/` owns shared GitHub request configuration and pagination; it does not define product-facing repository behavior.
- `errors/` defines safe public errors and maps upstream failures without leaking credentials.
- `shared/` contains a helper or type only after at least two features need the same behavior.

When adding profile or commit features, create their folders under `features/` and export them through the client only when their public methods are defined. Keep each feature's types local until another feature genuinely consumes them. Move code into `shared/` only after real reuse; avoid speculative shared abstractions.

Do not add top-level `utils/`, `services/`, `managers/`, `adapters/`, or `constants/` folders without a clear owner and multiple concrete files. Avoid barrel files at every directory level; use a feature's `index.ts` only where it forms a real public boundary. Keep implementation files small and split by operation when a module becomes difficult to navigate, not preemptively.

## Naming conventions

Use names that expose whether something is public API, internal GitHub data, or an operation:

| Element | Convention | Examples |
| --- | --- | --- |
| Files and directories | lowercase kebab-case for multiword names | `github-client.ts`, `repository-details.ts` |
| TypeScript variables and functions | `camelCase` | `createGitHubClient`, `pageSize`, `toRepository` |
| Types, classes, and enums | `PascalCase` | `Repository`, `RepositoryPage`, `GitHubApiError` |
| Constants | `UPPER_SNAKE_CASE` only for true module-level constants | `GITHUB_API_VERSION` |
| Boolean properties | `is`/`has` prefix | `isArchived`, `hasPrivateAccess` |
| Public method names | domain noun + clear verb | `repositories.list`, `repositories.get`, `repositories.getLanguages` |
| Tests | source name + `.test.ts` | `repositories.test.ts` |
| REST fields | map snake_case to public camelCase | `full_name` → `fullName` |
| GraphQL values | static operation name + named variables | `RepositoryDetails`, `$owner`, `$name` |

Use `GitHub` with this capitalization in API names and user-facing docs. Use the names from the normalized Repofy contract rather than GitHub's wire names (`stars`, not `stargazers_count`). Prefer `repository` over vague names such as `item` or `data` once the value's role is known. Do not abbreviate stable public names (`repo`, `lang`, `dir`) to save a few characters.

Name functions for the work they perform: `toRepository` for mapping, `listRepositories` for the REST-backed operation, and `createGitHubClient` for client construction. Avoid vague helpers such as `processData`, `handleResponse`, or `doRequest`. Do not encode transport choices in public names; callers should not need to know whether `get()` uses REST or GraphQL.

Keep public types distinct from API transport types. If an explicit REST response type is needed, suffix it with `Rest` (for example, `RestRepository`); name GraphQL-only shapes with `GraphQL`. Prefer inferred types from Octokit's endpoint declarations when they remain readable, instead of duplicating the entire upstream schema.

## GitHub API use

### REST list

Use GitHub's authenticated-user repositories endpoint, with `affiliation=owner`, to enforce the product rule that listing returns owned repositories only. Set `per_page` from the validated `pageSize`, capped at 100, and map the REST fields into the normalized `Repository` type. Do not fetch repository details or language breakdown inside this loop.

Use GitHub's `Link` pagination through `octokit.paginate.iterator()` or an equivalent one-page mechanism. Do not call the eager `octokit.paginate()` helper that retrieves every page before returning. Keep iterator state private; a public `next()` call advances it once and returns a new page, or `undefined` after exhaustion.

### GraphQL details

Use a static, focused GraphQL query for `repositories.get()`, selecting only fields included in the public normalized contract. Pass owner and repository name as variables; never interpolate user values into query source. Keep nested connections out of the details query unless the public API explicitly needs them and defines pagination.

Treat GraphQL `errors` as failures for the MVP, including responses that also contain partial `data`, unless a method explicitly documents partial results. This prevents returning apparently complete repository objects that silently omit requested fields.

### Language breakdown

Call the REST languages endpoint only in `getLanguages()`. Keep its numeric byte counts distinct from the language label in `Repository.primaryLanguage`.

### Versioning, headers, and limits

Send GitHub's recommended `Accept: application/vnd.github+json`, an explicit `X-GitHub-Api-Version`, and a meaningful `User-Agent`. Keep the API version in one internal configuration point and review it as part of dependency/API maintenance.

Respect rate-limit response headers. Do not add broad automatic retry loops in the MVP: surface a safe typed error, and if bounded retries are introduced later, honor `Retry-After` and `X-RateLimit-Reset`, use exponential backoff for secondary limits, cap attempts, and stop on non-retryable errors. Avoid issuing many requests concurrently for a single user flow.

## Credentials and errors

The consumer explicitly supplies a token. Use a fine-grained personal access token with the minimum read permissions required; private repositories also require the token to be granted access to those repositories. Repofy must never print, serialize, or include the token in an error message.

Browser use is possible but the token is visible to people who can use or inspect that browser application. Document this clearly. A server-side token is not automatically safe either: the application must store it securely and avoid exposing it in logs or client responses.

Convert Octokit and GraphQL failures into a small public error shape with safe fields such as message, HTTP status (when available), and request ID. Do not attach or print raw request objects, headers, or full Octokit error objects: request headers can contain the bearer token. Preserve an underlying cause only if doing so cannot cause accidental credential disclosure through common logging.

Useful error categories are invalid/unauthorized credentials, inaccessible or missing repository, rate limit, and other GitHub API failure. Avoid promising that every inaccessible private repository can be distinguished from a missing one; GitHub may return `404` for inaccessible private resources.

## TypeScript and package setup

- Write source in TypeScript and publish generated JavaScript plus declaration files.
- Use strict compiler checking, Node's `NodeNext` module behavior, and `verbatimModuleSyntax`. Include `.js` extensions in relative imports so emitted ESM and declaration imports resolve in Node without a bundler.
- Set the emitted JavaScript target to the lowest syntax level compatible with the declared Node engine floor. Align `@types/node` to that same floor, and check the package on both the minimum supported Node major and a current LTS.
- Start with ESM and declare `"type": "module"`; do not publish dual CommonJS/ESM output until consumer demand justifies its extra compatibility surface.
- Define `"exports"` to expose only the supported public entry point. Keep `src` and build output such as `dist` separate.
- Treat `exports` as the supported API boundary; keep Octokit and upstream response types out of exported declarations. Before publishing, inspect `npm pack --dry-run` and verify the built package can be imported by a consumer.
- Set and document a minimum Node version that is actively supported and tested. Use Node 22 or newer for the MVP baseline, then revisit the engine range when supported Node LTS lines change.
- Prefer platform APIs and Octokit over a custom HTTP client. Do not add a cache, retry framework, schema library, or framework integration without a demonstrated need.

An initial package shape can be as small as:

```json
{
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "engines": {
    "node": ">=22"
  }
}
```

Confirm output paths against the chosen TypeScript build configuration before publishing. Avoid adding a `require` condition unless CommonJS support is intentionally built and verified.

## Good and bad patterns

### Good: use variables with a fixed query

```ts
const repositoryQuery = `
  query RepositoryDetails($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      name
      description
      url
      stargazerCount
      forkCount
      isArchived
      defaultBranchRef { name }
    }
  }
`;

const result = await octokit.graphql(repositoryQuery, { owner, name });
return toRepositoryDetails(result.repository);
```

The query is controlled by the library, and values remain data variables.

### Bad: interpolate values into query text

```ts
const result = await octokit.graphql(`
  query { repository(owner: "${owner}", name: "${name}") { name } }
`);
```

This mixes user input with query syntax and risks malformed or unsafe queries. Keep query source static and use variables.

### Good: normalize and narrow the public contract

```ts
function toRepository(repo: RestRepository): Repository {
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    homepageUrl: repo.homepage,
    primaryLanguage: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    visibility: repo.visibility,
    isFork: repo.fork,
    isArchived: repo.archived,
    defaultBranch: repo.default_branch,
    topics: repo.topics,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    pushedAt: repo.pushed_at,
  };
}
```

This gives consumers stable names and prevents accidental publication of every upstream field.

### Bad: expose upstream JSON as the API

```ts
export async function listRepositories(): Promise<unknown[]> {
  return octokit.paginate("GET /user/repos");
}
```

This leaks GitHub's wire format, eagerly downloads all pages, and can include repositories outside the intended ownership rule.

### Good: return safe errors

```ts
throw new GitHubApiError("GitHub request failed", {
  status: error.status,
  requestId: error.response?.headers["x-github-request-id"],
});
```

### Bad: log the full API error

```ts
console.error(error);
```

Raw request/error objects may include authentication headers. Let the application decide how to log the safe public error.

## Maintenance checks

- Test mapping with representative REST and GraphQL fixtures, including null descriptions, missing default branches, and GraphQL errors with partial data.
- Test pagination with a fake transport and assert that page two is not requested until `next()` is called.
- Test that list requests include owner-only affiliation and that page size is bounded.
- Test that safe public errors do not contain the token or request headers.
- Before release, verify the packed npm artifact contains the public JS, declarations, and needed license/readme files; verify imports against the declared Node baseline.

These checks focus on the public contract, security boundary, and the request behavior most likely to regress. Use Node's built-in test runner initially; add a test framework only if its capabilities are needed.

## References

- [Node.js package entry points and module format](https://nodejs.org/api/packages.html)
- [TypeScript: choosing compiler options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options)
- [TypeScript: publishing declaration files](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)
- [GitHub REST repositories endpoints](https://docs.github.com/en/rest/repos/repos)
- [GitHub REST pagination](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api)
- [GitHub REST API best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api)
- [GitHub REST API versioning](https://docs.github.com/en/rest/about-the-rest-api/api-versions)
- [GitHub GraphQL pagination](https://docs.github.com/en/graphql/guides/using-pagination-in-the-graphql-api)
- [GitHub GraphQL rate and query limits](https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api)
- [GitHub API credential security](https://docs.github.com/en/rest/authentication/keeping-your-api-credentials-secure)
- [Octokit Core](https://github.com/octokit/core.js/)
- [Octokit REST pagination plugin](https://github.com/octokit/plugin-paginate-rest.js)
- [Octokit JavaScript client](https://github.com/octokit/octokit.js/)
