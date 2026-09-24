# MVP — Repofy

## Goal

Publish an initial version of the library so a Node.js or TypeScript application can query and display repositories owned by the authenticated user, without implementing GitHub API details manually.

## Platform and authentication

- Node.js package written in TypeScript.
- The consumer provides a GitHub personal access token when creating the client.
- Use only the read permissions needed for the selected repositories' metadata. Do not request write permissions.
- The token may be used in the frontend at the consumer's discretion, but it is not secret there: anyone using the browser can extract it. Documentation must explain this and recommend a fine-grained token with minimum read-only access.
- The library calls GitHub directly; there is no Repofy service that receives or stores tokens.

## Included operations

### `repositories.list(options?)`

Lists only repositories owned by the authenticated user. By default, it excludes repositories accessible only through collaboration or organization membership.

Each item uses a normalized `Repository` type with:

- `id`, `name`, `fullName`
- `description`, `url`, `homepageUrl`
- `primaryLanguage`
- `stars`, `forks`
- `visibility`, `isFork`, `isArchived`
- `defaultBranch`, `topics`
- `createdAt`, `updatedAt`, `pushedAt`

Minimum options: `visibility` (`all`, `public`, or `private`), `sort`, `direction`, and `pageSize`.

Returns one page with `items` and `next(): Promise<RepositoryPage | undefined>`. `next()` makes at most one additional request and returns `undefined` when exhausted. It does not fetch details or languages for each repository during listing.

### `repositories.get(owner, name)`

Fetches and normalizes details for a repository the token can access. It uses GraphQL when that can return related fields in one query. Access remains subject to the token's permissions.

### `repositories.getLanguages(owner, name)`

Returns the language distribution reported by GitHub, separately from listing to avoid one extra request for each repository listed.

## Internal behavior

- Use REST for paginated listing and language distribution.
- Use GraphQL to select related repository detail fields.
- Keep field selections focused and paginate on demand.
- Handle HTTP errors, GraphQL errors, rate limits, and partial responses as described in `../github-api/`.
- Do not expose raw GitHub responses as the library's primary contract.

## Acceptance criteria

1. Consumers can create a client with an explicit token.
2. Consumers can list only their own public repositories, private repositories, or all owned repositories visible to the token.
3. Each listed repository includes the normalized fields above, including description, primary language, stars, and URL.
4. The next page is requested only when the consumer asks for it.
5. Repository details and language distribution can be queried separately.
6. The package does not modify GitHub data.
7. Documentation explains how to obtain and provide a token, and the risk of using it in a browser.

## Out of the MVP

OAuth, write operations, commits, profile data, support for other languages, persistent caching, framework-specific React integration, and automatically fetching details for every repository.
