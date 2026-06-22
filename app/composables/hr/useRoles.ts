import { useApi } from "~/composables/common/useApi";
import type { Role } from "~/types/hr/roles";
import type { ApiResponse } from "~/types/common/api";

// `parent_role` is sent as a role id (resolved to parent_id server-side).
// `num_of_members` and `child_role` are server-derived / read-only.
export type RoleInput = Omit<Role, "id" | "num_of_members" | "child_role">;

export function useRoles() {
  const api = useApi();

  /**
   * Read roles — fetches a single page of roles from the API, optionally
   * searched and sorted (sort uses the `-field` prefix for descending, e.g.
   * `-created_at`). Returns the full response so callers can read both `data`
   * and `pagination`. Also backs the `HrRolesSelect` component.
   */
  const fetchRoles = async (
    params: { page?: number; search?: string; sort?: string | null } = {},
  ): Promise<ApiResponse<Role[]>> => {
    const { page = 1, search = "", sort = null } = params;
    return await api<ApiResponse<Role[]>>("/roles", {
      query: { page, search, sort: sort ?? "" },
    });
  };

  /**
   * Read a single role — fetches one role by its id.
   */
  const fetchRole = async (id: string): Promise<Role> => {
    const res = await api<ApiResponse<Role>>(`/roles/${id}`);
    return res.data;
  };

  /**
   * Create a role — sends a new role to the API and returns the created record
   * (including its server-assigned id).
   */
  const createRole = async (input: RoleInput): Promise<Role> => {
    const res = await api<ApiResponse<Role>>("/roles", {
      method: "POST",
      body: input,
    });
    return res.data;
  };

  /**
   * Update a role — sends changed fields for an existing role (identified by id)
   * and returns the updated record.
   */
  const updateRole = async (
    id: string,
    input: Partial<RoleInput>,
  ): Promise<Role> => {
    const res = await api<ApiResponse<Role>>(`/roles/${id}`, {
      method: "PUT",
      body: input,
    });
    return res.data;
  };

  return {
    fetchRoles,
    fetchRole,
    createRole,
    updateRole,
  };
}
