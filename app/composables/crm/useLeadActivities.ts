import { useApi } from "~/composables/common/useApi";
import type { LeadActivity, LeadActivityInput } from "~/types/crm/leads";
import type { ApiResponse } from "~/types/common/api";

export function useLeadActivities() {
  const api = useApi();

  const fetchLeadActivities = async (
    leadId: string,
    params: { page?: number; per_page?: number } = {},
  ): Promise<ApiResponse<LeadActivity[]>> => {
    const { page = 1, per_page = 15 } = params;
    return await api<ApiResponse<LeadActivity[]>>(
      `/leads/${leadId}/activities`,
      { query: { page, per_page } },
    );
  };

  const createLeadActivity = async (
    leadId: string,
    input: LeadActivityInput,
  ): Promise<LeadActivity> => {
    const res = await api<ApiResponse<LeadActivity>>(
      `/leads/${leadId}/activities`,
      { method: "POST", body: input },
    );
    return res.data;
  };

  return { fetchLeadActivities, createLeadActivity };
}
