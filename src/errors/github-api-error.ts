export class GitHubApiError extends Error {
  readonly status: number | undefined;
  readonly requestId: string | undefined;

  constructor(
    message: string,
    options: { status?: number; requestId?: string } = {},
  ) {
    super(message);
    this.name = "GitHubApiError";
    this.status = options.status;
    this.requestId = options.requestId;
  }
}

export function toGitHubApiError(error: unknown): GitHubApiError {
  if (error instanceof GitHubApiError) return error;
  const response =
    typeof error === "object" && error !== null && "response" in error
      ? (error as { response?: { headers?: Record<string, string> } }).response
      : undefined;
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? (error as { status?: number }).status
      : undefined;
  return new GitHubApiError(
    status === 401 ? "GitHub authentication failed" : "GitHub request failed",
    {
      status,
      requestId:
        response?.headers?.["x-github-request-id"] ??
        (response?.headers as unknown as Headers | undefined)?.get(
          "x-github-request-id",
        ) ??
        undefined,
    },
  );
}
