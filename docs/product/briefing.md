# Briefing — Repofy

## Vision

Repofy is a read-only library for Node.js and TypeScript that makes GitHub data easier to query and display. Consumers use high-level methods; the choice between REST and GraphQL stays internal.

## Problem

To load repository data, an application must understand endpoints, authentication, pagination, and different response formats. This repeats code and makes common queries more difficult than they need to be.

## Audience

- Developers using Node.js or TypeScript in backend or frontend applications.
- Applications that need to display repositories owned by the authenticated user.

## Value proposition

A small, consistent interface for listing repositories, querying details, and getting language data, without requiring each application to implement GitHub API calls and normalize responses.

## Principles

- Read-only: the library does not create, edit, or delete GitHub data.
- A stable, normalized public API independent of raw REST or GraphQL response formats.
- On-demand pagination; do not load all repositories or their details in one call.
- Credentials are provided by the consumer. Tokens are not sent to a Repofy service.
- Compatible with Node.js and TypeScript. Browser use is allowed, with a clear warning that browser users can extract the token.

## Out of initial scope

- OAuth and token storage or brokering.
- GitHub write operations.
- Profile data, commits, issues, pull requests, and organizations.
- Python or other languages.
- A client specific to React or another framework.

## Related documents

- [MVP scope](mvp.md)
- [Proposed usage guide](guide.md)
- [Project REST reference](../github-api/REST.md)
- [Project GraphQL reference](../github-api/GRAPHQL.md)
