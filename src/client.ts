import { Octokit } from "@octokit/rest";
import { listRepositories } from "./features/repositories/list-repositories.js";
import type { RepositoryListOptions } from "./features/repositories/types.js";

export function createGitHubClient({ token }: { token: string }) {
  const octokit = new Octokit({ auth: token });

  return {
    repositories: {
      list: (options?: RepositoryListOptions) =>
        listRepositories(octokit, options),
    },
  };
}
