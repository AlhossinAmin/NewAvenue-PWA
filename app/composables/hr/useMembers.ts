import { useApi } from "~/composables/common/useApi";
import type { Member } from "~/types/hr/members";
import type { ApiResponse } from "~/types/common/api";

export type MemberInput = Omit<Member, "id">;

export function useMembers() {
  const api = useApi();

  /**
   * Read members — fetches a single page of members from the API, optionally
   * searched and sorted (sort uses the `-field` prefix for descending, e.g.
   * `-created_at`). Returns the full response so callers can read both `data`
   * and `pagination`. Also backs the `AgentSelect` component.
   */
  const fetchMembers = async (
    params: { page?: number; search?: string; sort?: string | null } = {},
  ): Promise<ApiResponse<Member[]>> => {
    const { page = 1, search = "", sort = null } = params;
    return await api<ApiResponse<Member[]>>("/members", {
      query: { page, search, sort: sort ?? "" },
    });
  };

  /**
   * Read a single member — fetches one member by its id.
   */
  const fetchMember = async (id: string): Promise<Member> => {
    const res = await api<ApiResponse<Member>>(`/members/${id}`);
    return res.data;
  };

  /**
   * Create a member — sends a new member to the API and returns the created
   * record (including its server-assigned id).
   */
  const createMember = async (input: MemberInput): Promise<Member> => {
    const res = await api<ApiResponse<Member>>("/members", {
      method: "POST",
      body: input,
    });
    return res.data;
  };

  /**
   * Update a member — sends changed fields for an existing member (identified by
   * id) and returns the updated record.
   */
  const updateMember = async (
    id: string,
    input: Partial<MemberInput>,
  ): Promise<Member> => {
    const res = await api<ApiResponse<Member>>(`/members/${id}`, {
      method: "PUT",
      body: input,
    });
    return res.data;
  };

  return {
    fetchMembers,
    fetchMember,
    createMember,
    updateMember,
  };
}
