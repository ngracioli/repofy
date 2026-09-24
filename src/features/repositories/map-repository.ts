import type { Octokit } from "@octokit/rest";
import type { Repository } from "./types.js";

type RestRepository = Awaited<
  ReturnType<Octokit["rest"]["repos"]["listForAuthenticatedUser"]>
>["data"][number];

export function toRepository(repository: RestRepository): Repository {
  return {
    id: repository.id,
    name: repository.name,
    fullName: repository.full_name,
    description: repository.description,
    url: repository.html_url,
    homepageUrl: repository.homepage,
    primaryLanguage: repository.language,
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    visibility:
      repository.visibility ?? (repository.private ? "private" : "public"),
    isFork: repository.fork,
    isArchived: repository.archived,
    defaultBranch: repository.default_branch ?? "",
    topics: repository.topics ?? [],
    createdAt: repository.created_at ?? "",
    updatedAt: repository.updated_at ?? "",
    pushedAt: repository.pushed_at,
  };
}
