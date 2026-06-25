import { useApi } from "~/composables/common/useApi";
import type { ActivityLog } from "~/types/crm/activity-logs";
import type { ApiResponse } from "~/types/common/api";

// The audit log is read-only; filters narrow the feed by subject, causer, event
// type, and date range. All are optional and omitted (sent blank) when unset.
export interface ActivityLogFilters {
  subject_type?: string;
  subject_id?: string;
  causer_id?: string;
  event?: string;
  // `from`/`to` are inclusive date bounds in `YYYY-MM-DD` form.
  from?: string;
  to?: string;
}

export function useActivityLogs() {
  const api = useApi();

  /**
   * Read activity logs — fetches a single page of audit entries, optionally
   * filtered. Returns the full response so callers can read both `data` and
   * `pagination`.
   */
  const fetchActivityLogs = async (
    params: { page?: number; per_page?: number } & ActivityLogFilters = {},
  ): Promise<ApiResponse<ActivityLog[]>> => {
    const {
      page = 1,
      per_page = 15,
      subject_type = "",
      subject_id = "",
      causer_id = "",
      event = "",
      from = "",
      to = "",
    } = params;
    return await api<ApiResponse<ActivityLog[]>>("/activity-logs", {
      query: {
        page,
        per_page,
        subject_type,
        subject_id,
        causer_id,
        event,
        from,
        to,
      },
    });
  };

  return { fetchActivityLogs };
}
