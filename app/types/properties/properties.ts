import type { MediaItem } from "~/types/common/media";

export type PropertyCategory = "Residential" | "Commercial";

export type TransactionType = "sell" | "rent";

// Human-readable labels for each offering type (the API values are the terse
// "sell" / "rent"). Used by selects, table cells, and filter chips.
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  sell: "For Sale",
  rent: "For Rent",
};

// Shape of the property form's reactive state, shared across the form sections
// (see components/properties/properties/form). The API returns `project`/
// `developer` as { id, name } objects, but the form works with their UUIDs.
// `photos` holds { id, url } objects in state and is reshaped to media ids on
// submit. Some fields (e.g. `neighborhood`) are form-only inputs not on the
// `Property` read type below.
export interface PropertyFormState {
  category?: PropertyCategory;
  type: string;
  transaction_type?: TransactionType;
  // UUIDs of the linked project and the seller contact. A "rent" offering needs
  // a seller; a "sell" offering needs a seller and/or a project (at least one).
  project: string;
  seller: string;
  developer?: string;
  building_num?: number;
  floor_num?: number;
  unit_number?: number;
  installments_available: boolean;
  num_installments?: number;
  installment_value?: number;
  price?: number;
  commission_scheme?: number;
  country: string;
  city: string;
  district: string;
  neighborhood?: string;
  street: string;
  area?: number;
  built_up_area?: number;
  delivery_year?: number;
  num_bedrooms?: number;
  num_bathrooms?: number;
  amenities: string[];
  photos: MediaItem[];
  description: string;
}

// On reads the API returns the linked project and developer as nested objects;
// writes still take just their UUIDs (see `PropertyInput` in useProperties).
export interface PropertyProject {
  id: string;
  name: string;
}

export interface PropertyDeveloper {
  id: string;
  name: string;
}

// The seller is a CRM contact; reads return it nested, writes send just its id.
export interface PropertySeller {
  id: string;
  name: string;
}

export interface Property {
  id: string;
  unit_num: string;
  floor_num: number;
  // project/developer are optional links — both may be null (e.g. a resale or a
  // rental listed by a seller with no developer project).
  project: PropertyProject | null;
  developer: PropertyDeveloper | null;
  seller: PropertySeller | null;
  category: PropertyCategory;
  type: string;
  transaction_type: TransactionType;
  price: number;
  commission_scheme: number;
  country: string;
  city: string;
  district: string;
  area: number;
  delivery_year: number;
  description: string;
  latitude: number;
  longtitude: number;
  amenities: string[];
  num_bedrooms: number;
  num_bathrooms: number;
  compound: string;
  street: string;
  // Kept as a plain string column server-side (not media-managed).
  featured_photo: string;
  // Read shape of the `photos` media collection — `{ id, url }` objects. On
  // writes only the ids are sent (see `PropertyInput` in useProperties).
  photos?: MediaItem[];
  // Installment plan — present only when the unit offers installments.
  installments_available?: boolean;
  num_installments?: number;
  installment_value?: number;
  // Server-managed timestamps (ISO 8601), returned on reads.
  created_at?: string;
  updated_at?: string;
}
