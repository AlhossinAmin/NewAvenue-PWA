import { useApi } from "~/composables/common/useApi";
import type { Project } from "~/types/properties/projects";
import type { ApiResponse } from "~/types/common/api";

// On write the API expects `developer` as the developer's UUID (not the nested
// object returned on reads), and `photos` as an array of media ids (the read
// shape is `{ id, url }` objects — see `Project.photos`).
export type ProjectInput = Omit<Project, "id" | "developer" | "photos"> & {
  developer: string;
  photos: number[];
};

export function useProjects() {
  const api = useApi();

  /**
   * Read projects — fetches a single page of projects from the API, optionally
   * searched and sorted (sort uses the `-field` prefix for descending, e.g.
   * `-created_at`). Returns the full response so callers can read both `data`
   * and `pagination`.
   */
  const fetchProjects = async (
    params: { page?: number; search?: string; sort?: string | null } = {},
  ): Promise<ApiResponse<Project[]>> => {
    const { page = 1, search = "", sort = null } = params;
    return await api<ApiResponse<Project[]>>("/projects", {
      query: { page, search, sort: sort ?? "" },
    });
  };

  /**
   * Read a single project — fetches one project by its id.
   */
  const fetchProject = async (id: string): Promise<Project> => {
    const res = await api<ApiResponse<Project>>(`/projects/${id}`);
    return res.data;
  };

  /**
   * Create a project — sends a new project to the API and returns the created
   * record (including its server-assigned id).
   */
  const createProject = async (input: ProjectInput): Promise<Project> => {
    const res = await api<ApiResponse<Project>>("/projects", {
      method: "POST",
      body: input,
    });
    return res.data;
  };

  /**
   * Update a project — sends changed fields for an existing project (identified
   * by id) and returns the updated record.
   */
  const updateProject = async (
    id: string,
    input: Partial<ProjectInput>,
  ): Promise<Project> => {
    const res = await api<ApiResponse<Project>>(`/projects/${id}`, {
      method: "PUT",
      body: input,
    });
    return res.data;
  };

  return {
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
  };
}
