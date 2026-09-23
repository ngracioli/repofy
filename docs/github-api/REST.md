# GitHub REST API

Use REST for resource-oriented operations when a documented endpoint directly matches the job: read or change a repository, issue, pull request, workflow, release, and other GitHub resource. HTTP method and endpoint identify the operation. It is often the simplest choice for a single resource action.

## Endpoint and request

GitHub.com API base URL: `https://api.github.com`. Each request uses a path such as `/repos/{owner}/{repo}/issues` and a method such as `GET`, `POST`, `PATCH`, or `DELETE`.

Typical headers:

```http
Accept: application/vnd.github+json
Authorization: Bearer <TOKEN>
X-GitHub-Api-Version: 2026-03-10
```

Use the current version documented by GitHub when implementing a new integration; the date above is an example reflecting the documentation checked for this guide. Confirm the endpoint's required permissions and request/response shape in its endpoint reference. Some public-data endpoints allow unauthenticated requests; private data and write operations require appropriate authorization.

## Pagination, limits, and errors

- Follow the response `Link` header to retrieve subsequent pages. Do not assume the first page contains all results.
- Respect `x-ratelimit-*` and `Retry-After` headers. On a primary limit, wait until `x-ratelimit-reset`; on secondary limits, wait as instructed and use bounded exponential backoff.
- Check HTTP status and response body. `403` or `404` may indicate insufficient permissions or an inaccessible resource, not necessarily that it does not exist.

## Source of truth

- [REST API documentation](https://docs.github.com/en/rest)
- [Getting started](https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api)
- [Authentication](https://docs.github.com/en/rest/authentication)
- [Pagination](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api)
- [Rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
- [OpenAPI description](https://github.com/github/rest-api-description)

The OpenAPI repository contains machine-readable REST endpoint descriptions. Select the correct GitHub product and version; the `descriptions-next` content may change. Check operation details there and in the endpoint docs rather than inventing paths or parameters.
