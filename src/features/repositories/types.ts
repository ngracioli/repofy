export type Repository = {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  primaryLanguage: string | null;
  stars: number;
  forks: number;
  visibility: string;
  isFork: boolean;
  isArchived: boolean;
  defaultBranch: string;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  pushedAt: string | null;
};

export type RepositoryListOptions = {
  visibility?: "all" | "public" | "private";
  sort?: "created" | "updated" | "pushed" | "full_name";
  direction?: "asc" | "desc";
  pageSize?: number;
};

export type RepositoryPage = {
  items: Repository[];
  next(): Promise<RepositoryPage | undefined>;
};
