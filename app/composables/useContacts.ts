import { useApi } from "~/composables/useApi";
import type { Contact } from "~/constants/dummy/contacts";
import type { ApiResponse } from "~/types/api";

// Dates and the last-active-lead link are server-managed; the form only sends
// the editable fields.
export type ContactInput = Omit<
  Contact,
  "id" | "last_active_lead" | "last_activity_date" | "date_created"
>;

export function useContacts() {
  const api = useApi();

  /**
   * Read contacts — fetches a single page of contacts from the API, optionally
   * searched and sorted (sort uses the `-field` prefix for descending, e.g.
   * `-created_at`). Returns the full response so callers can read both `data`
   * and `pagination`.
   */
  const fetchContacts = async (
    params: { page?: number; search?: string; sort?: string | null } = {},
  ): Promise<ApiResponse<Contact[]>> => {
    const { page = 1, search = "", sort = null } = params;
    return await api<ApiResponse<Contact[]>>("/contacts", {
      query: { page, search, sort: sort ?? "" },
    });
  };

  /**
   * Read a single contact — fetches one contact by its id.
   */
  const fetchContact = async (id: string): Promise<Contact> => {
    const res = await api<ApiResponse<Contact>>(`/contacts/${id}`);
    return res.data;
  };

  /**
   * Create a contact — sends a new contact to the API and returns the created
   * record (including its server-assigned id).
   */
  const createContact = async (input: ContactInput): Promise<Contact> => {
    const res = await api<ApiResponse<Contact>>("/contacts", {
      method: "POST",
      body: input,
    });
    return res.data;
  };

  /**
   * Update a contact — sends changed fields for an existing contact (identified
   * by id) and returns the updated record.
   */
  const updateContact = async (
    id: string,
    input: Partial<ContactInput>,
  ): Promise<Contact> => {
    const res = await api<ApiResponse<Contact>>(`/contacts/${id}`, {
      method: "PUT",
      body: input,
    });
    return res.data;
  };

  return {
    fetchContacts,
    fetchContact,
    createContact,
    updateContact,
  };
}
