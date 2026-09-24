import type { Octokit } from "@octokit/rest";
import {
  GitHubApiError,
  toGitHubApiError,
} from "../../errors/github-api-error.js";
import { toRepository } from "./map-repository.js";
import type { RepositoryListOptions, RepositoryPage } from "./types.js";

export async function listRepositories(
  octokit: Octokit,
  options: RepositoryListOptions = {},
): Promise<RepositoryPage> {
  const pageSize = options.pageSize ?? 30;
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new RangeError("pageSize must be an integer between 1 and 100");
  }
  const iterator = octokit.paginate
    .iterator(octokit.rest.repos.listForAuthenticatedUser, {
      affiliation: "owner",
      visibility: options.visibility,
      sort: options.sort,
      direction: options.direction,
      per_page: pageSize,
    })
    [Symbol.asyncIterator]();

  async function readPage(): Promise<RepositoryPage | undefined> {
    try {
      const result = await iterator.next();
      if (result.done) return undefined;
      return { items: result.value.data.map(toRepository), next: readPage };
    } catch (error) {
      throw toGitHubApiError(error);
    }
  }

  const page = await readPage();
  if (!page) throw new GitHubApiError("GitHub returned no repository page");
  return page;
}
