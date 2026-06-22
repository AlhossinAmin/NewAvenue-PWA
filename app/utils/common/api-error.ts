import type { ApiResponse } from "~/types/common/api";

// Pull the human-readable message out of a failed useApi() call. $fetch throws a
// FetchError whose `data` holds the parsed error envelope ({ meta.error.message }).
export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong",
): string => {
  const body = (error as { data?: ApiResponse<unknown> | null })?.data;
  return body?.meta?.error?.message ?? fallback;
};
