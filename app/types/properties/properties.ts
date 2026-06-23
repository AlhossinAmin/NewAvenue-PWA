import type { MediaItem } from "~/types/common/media";

export type PropertyCategory = "Residential" | "Commercial";

export type TransactionType = "Primary" | "Resale" | "Rent";

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

export interface Property {
  id: string;
  unit_num: string;
  floor_num: number;
  project: PropertyProject;
  developer: PropertyDeveloper;
  category: PropertyCategory;
  type: string;
  transaction_type: TransactionType;
  seller_name: string;
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
