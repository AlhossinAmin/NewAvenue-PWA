import { useApi } from "~/composables/common/useApi";
import type { Lead } from "~/types/crm/leads";
import type { ApiResponse } from "~/types/common/api";

// On write the API expects `customer` and `assigned_agent` as UUIDs (not the
// nested objects returned on reads).
export type LeadInput = Omit<Lead, "id" | "customer" | "assigned_agent"> & {
  customer: string;
  assigned_agent?: string;
};

export function useLeads() {
  const api = useApi();

  /**
   * Read leads — fetches a single page of leads from the API, optionally
   * searched and sorted (sort uses the `-field` prefix for descending, e.g.
   * `-lead_date`). Returns the full response so callers can read both `data`
   * and `pagination`.
   */
  const fetchLeads = async (
    params: { page?: number; search?: string; sort?: string | null } = {},
  ): Promise<ApiResponse<Lead[]>> => {
    const { page = 1, search = "", sort = null } = params;
    return await api<ApiResponse<Lead[]>>("/leads", {
      query: { page, search, sort: sort ?? "" },
    });
  };

  /**
   * Read a single lead — fetches one lead by its id.
   */
  const fetchLead = async (id: string): Promise<Lead> => {
    const res = await api<ApiResponse<Lead>>(`/leads/${id}`);
    return res.data;
  };

  /**
   * Create a lead — sends a new lead to the API and returns the created record
   * (including its server-assigned id).
   */
  const createLead = async (input: LeadInput): Promise<Lead> => {
    const res = await api<ApiResponse<Lead>>("/leads", {
      method: "POST",
      body: input,
    });
    return res.data;
  };

  /**
   * Update a lead — sends changed fields for an existing lead (identified by id)
   * and returns the updated record.
   */
  const updateLead = async (
    id: string,
    input: Partial<LeadInput>,
  ): Promise<Lead> => {
    const res = await api<ApiResponse<Lead>>(`/leads/${id}`, {
      method: "PUT",
      body: input,
    });
    return res.data;
  };

  return {
    fetchLeads,
    fetchLead,
    createLead,
    updateLead,
  };
}
