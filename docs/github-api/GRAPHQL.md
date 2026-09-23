# GitHub GraphQL API

Use GraphQL when the task needs a tailored set of related fields that would otherwise require several REST reads, or when a supported mutation is the direct fit. A single query can traverse related objects and returns the fields explicitly selected. GraphQL is not automatically better: choose REST when its endpoint directly covers the operation or GraphQL does not expose it.

## Endpoint and request

GitHub.com endpoint: `https://api.github.com/graphql`. Send a `POST` with a JSON body containing `query`; provide values separately in `variables` where practical. Authenticate with a token that has the required permissions.

```json
{
  "query": "query($owner: String!, $name: String!) { repository(owner: $owner, name: $name) { nameWithOwner url } }",
  "variables": { "owner": "octocat", "name": "Spoon-Knife" }
}
```

Queries read data. Mutations perform supported changes and require an input object and a selected payload. Verify the exact operation, fields, argument types, and permissions against the live schema reference before writing a call; do not guess names or enum values.

## Pagination, limits, and errors

- Every connection must specify `first` or `last` (1–100). Continue with `pageInfo.hasNextPage` and `pageInfo.endCursor` passed as `after` until complete.
- Keep selection sets focused and avoid deep, high-volume nested connections. GraphQL uses a separate points-based rate limit; inspect rate-limit headers and query cost. Handle timeouts and resource-limit failures.
- Check both HTTP status and the GraphQL `errors` array. A response can contain partial `data` and errors at the same time; do not treat non-null `data` alone as success.

## Source of truth

- [GraphQL API documentation and schema reference](https://docs.github.com/en/graphql)
- [About the API and schema](https://docs.github.com/en/graphql/overview/about-the-graphql-api)
- [Forming calls](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql)
- [Pagination](https://docs.github.com/en/graphql/guides/using-pagination-in-the-graphql-api)
- [Rate and query limits](https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api)

The schema documentation is generated from GitHub's GraphQL schema and can evolve. For data that depends on GitHub.com, permissions, or product deployment, verify the current schema and access rules at implementation time.
