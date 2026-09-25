import { Octokit } from "@octokit/rest";
import { listRepositories } from "./features/repositories/list-repositories.js";
import type { RepositoryListOptions } from "./features/repositories/types.js";

export function createGitHubClient({ token }: { token: string }) {
  const octokit = new Octokit({ auth: token });
  const list = (options?: RepositoryListOptions) =>
    listRepositories(octokit, options);
  const listWithVisibility = (
    visibility: NonNullable<RepositoryListOptions["visibility"]>,
    options?: Omit<RepositoryListOptions, "visibility">,
  ) => list({ ...options, visibility });

  return {
    repositories: {
      listAll: (options?: Omit<RepositoryListOptions, "visibility">) =>
        listWithVisibility("all", options),
      listPublic: (options?: Omit<RepositoryListOptions, "visibility">) =>
        listWithVisibility("public", options),
      listPrivate: (options?: Omit<RepositoryListOptions, "visibility">) =>
        listWithVisibility("private", options),
    },
  };
}
