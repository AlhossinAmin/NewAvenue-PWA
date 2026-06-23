import { useApi } from "~/composables/common/useApi";
import type { Developer } from "~/types/properties/developers";
import type { ApiResponse } from "~/types/common/api";

// On write `logo` is a media id (or null to clear); the read shape is a URL
// string (see `Developer.logo`). Omitting it leaves the existing logo untouched.
export type DeveloperInput = Omit<Developer, "id" | "logo"> & {
  logo?: number | null;
};

export function useDevelopers() {
  const api = useApi();

  /**
   * Read developers — fetches a single page of developers from the API,
   * optionally searched and sorted (sort uses the `-field` prefix for
   * descending, e.g. `-created_at`). Returns the full response so callers can
   * read both `data` and `pagination`.
   */
  const fetchDevelopers = async (
    params: { page?: number; search?: string; sort?: string | null } = {},
  ): Promise<ApiResponse<Developer[]>> => {
    const { page = 1, search = "", sort = null } = params;
    return await api<ApiResponse<Developer[]>>("/developers", {
      query: { page, search, sort: sort ?? "" },
    });
  };

  /**
   * Read a single developer — fetches one developer by its id.
   */
  const fetchDeveloper = async (id: string): Promise<Developer> => {
    const res = await api<ApiResponse<Developer>>(`/developers/${id}`);
    return res.data;
  };

  /**
   * Create a developer — sends a new developer to the API and returns the
   * created record (including its server-assigned id).
   */
  const createDeveloper = async (input: DeveloperInput): Promise<Developer> => {
    const res = await api<ApiResponse<Developer>>("/developers", {
      method: "POST",
      body: input,
    });
    return res.data;
  };

  /**
   * Update a developer — sends changed fields for an existing developer
   * (identified by id) and returns the updated record.
   */
  const updateDeveloper = async (
    id: string,
    input: Partial<DeveloperInput>,
  ): Promise<Developer> => {
    const res = await api<ApiResponse<Developer>>(`/developers/${id}`, {
      method: "PUT",
      body: input,
    });
    return res.data;
  };

  return {
    fetchDevelopers,
    fetchDeveloper,
    createDeveloper,
    updateDeveloper,
  };
}
