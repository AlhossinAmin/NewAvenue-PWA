import { useApi } from "~/composables/common/useApi";
import type { Property } from "~/types/properties/properties";
import type { ApiResponse } from "~/types/common/api";

// On write the API expects `project`, `developer`, and `seller` as UUIDs (not
// the nested objects returned on reads). All are optional; the backend enforces
// the offering rules (rent needs a seller; sell needs a seller and/or project).
export type PropertyInput = Omit<
  Property,
  | "id"
  | "created_at"
  | "updated_at"
  | "project"
  | "developer"
  | "seller"
  | "photos"
> & {
  project?: string;
  developer?: string;
  seller?: string;
  // Array of media ids; the read shape is `{ id, url }` objects (see
  // `Property.photos`). `featured_photo` stays a plain string.
  photos?: number[];
};

// Option lists + numeric bounds that drive the list page's filter controls.
// Select filters can't derive their full option set from a single paginated
// page, so the server supplies them (see GET /properties/filters).
export interface PropertyFacets {
  category: string[];
  transaction_type: string[];
  type: string[];
  district: string[];
  num_bedrooms: number[];
  project: { id: string; name: string }[];
  area: { min: number; max: number };
  price: { min: number; max: number };
}

export function useProperties() {
  const api = useApi();

  /**
   * Read properties — fetches a single page of properties from the API,
   * optionally searched and sorted (sort uses the `-field` prefix for
   * descending, e.g. `-price`). Returns the full response so callers can read
   * both `data` and `pagination`.
   */
  const fetchProperties = async (
    params: {
      page?: number;
      search?: string;
      sort?: string | null;
      // Pre-built filter query params, e.g. { "category[]": ["Residential"],
      // price_min: 5000000 }. Merged as-is into the request query.
      filters?: Record<string, unknown>;
    } = {},
  ): Promise<ApiResponse<Property[]>> => {
    const { page = 1, search = "", sort = null, filters = {} } = params;
    return await api<ApiResponse<Property[]>>("/properties", {
      query: { page, search, sort: sort ?? "", ...filters },
    });
  };

  /**
   * Read every property — pages through the full list and returns the flattened
   * records. Used by views that aggregate the whole dataset (e.g. the dashboard
   * sales metrics) where the API exposes no dedicated summary endpoint. The
   * first page reveals the page count, then the remainder is fetched in
   * parallel.
   */
  const fetchAllProperties = async (
    params: {
      search?: string;
      sort?: string | null;
      filters?: Record<string, unknown>;
    } = {},
  ): Promise<Property[]> => {
    const first = await fetchProperties({ ...params, page: 1 });
    const all = [...first.data];
    const lastPage = Array.isArray(first.pagination)
      ? 1
      : first.pagination.last_page;
    if (lastPage > 1) {
      const rest = await Promise.all(
        Array.from({ length: lastPage - 1 }, (_, i) =>
          fetchProperties({ ...params, page: i + 2 }),
        ),
      );
      for (const res of rest) all.push(...res.data);
    }
    return all;
  };

  /**
   * Read filter facets — the option lists and numeric bounds used to populate
   * the list page's filter controls.
   */
  const fetchPropertyFacets = async (): Promise<PropertyFacets> => {
    const res = await api<ApiResponse<PropertyFacets>>("/properties/filters");
    return res.data;
  };

  /**
   * Read a single property — fetches one property by its id.
   */
  const fetchProperty = async (id: string): Promise<Property> => {
    const res = await api<ApiResponse<Property>>(`/properties/${id}`);
    return res.data;
  };

  /**
   * Create a property — sends a new property to the API and returns the created
   * record (including its server-assigned id).
   */
  const createProperty = async (input: PropertyInput): Promise<Property> => {
    const res = await api<ApiResponse<Property>>("/properties", {
      method: "POST",
      body: input,
    });
    return res.data;
  };

  /**
   * Update a property — sends changed fields for an existing property
   * (identified by id) and returns the updated record.
   */
  const updateProperty = async (
    id: string,
    input: Partial<PropertyInput>,
  ): Promise<Property> => {
    const res = await api<ApiResponse<Property>>(`/properties/${id}`, {
      method: "PUT",
      body: input,
    });
    return res.data;
  };

  return {
    fetchProperties,
    fetchAllProperties,
    fetchPropertyFacets,
    fetchProperty,
    createProperty,
    updateProperty,
  };
}
