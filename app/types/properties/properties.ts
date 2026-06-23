import type { MediaItem } from "~/types/common/media";

export type PropertyCategory = "Residential" | "Commercial";

export type TransactionType = "sell" | "rent";

// Human-readable labels for each offering type (the API values are the terse
// "sell" / "rent"). Used by selects, table cells, and filter chips.
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  sell: "For Sale",
  rent: "For Rent",
};

// Where a property sits in an external listing portal's publishing pipeline:
// not yet sent, awaiting the portal's review, or live.
export type PublicationStatus = "unpublished" | "pending" | "published";

// The external listing portals a property can be published to. The key is the
// terse API value; the label is what the UI shows.
export type PublishingPlatform = "property_finder" | "bayut" | "dubizzle";

export interface PublishingPlatformMeta {
  key: PublishingPlatform;
  label: string;
  // Brand icon name (iconify) for the portal, shown alongside its status.
  icon: string;
}

// Ordered list of supported portals — drives the per-platform status display
// on the table and detail views.
export const PUBLISHING_PLATFORMS: PublishingPlatformMeta[] = [
  { key: "property_finder", label: "Property Finder", icon: "i-lucide-search" },
  { key: "bayut", label: "Bayut", icon: "i-lucide-building-2" },
  { key: "dubizzle", label: "Dubizzle", icon: "i-lucide-tag" },
];

export const PUBLICATION_STATUS_LABELS: Record<PublicationStatus, string> = {
  unpublished: "Unpublished",
  pending: "Pending",
  published: "Published",
};

// Badge color per status for UI display (maps to Nuxt UI badge colors).
export const PUBLICATION_STATUS_COLORS: Record<
  PublicationStatus,
  "neutral" | "warning" | "success"
> = {
  unpublished: "neutral",
  pending: "warning",
  published: "success",
};

// Select options for a publication status (label + value).
export const PUBLICATION_STATUS_OPTIONS: {
  label: string;
  value: PublicationStatus;
}[] = (["unpublished", "pending", "published"] as PublicationStatus[]).map(
  (value) => ({ label: PUBLICATION_STATUS_LABELS[value], value }),
);

// A fresh publications record with every supported platform set to
// "unpublished" — used to seed the property form. Optionally merge in known
// statuses (e.g. from a record being edited).
export const createPublications = (
  initial?: Partial<Record<PublishingPlatform, PublicationStatus>>,
): Record<PublishingPlatform, PublicationStatus> =>
  Object.fromEntries(
    PUBLISHING_PLATFORMS.map((platform) => [
      platform.key,
      initial?.[platform.key] ?? "unpublished",
    ]),
  ) as Record<PublishingPlatform, PublicationStatus>;

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
  // Per-portal publication status. Every supported platform is present as a key
  // (defaulting to "unpublished") so the form's selects always have a binding.
  publications: Record<PublishingPlatform, PublicationStatus>;
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
  // Per-portal publication status — where the listing currently stands on each
  // external website (Property Finder, Bayut, Dubizzle, …). Absent platforms are
  // treated as "unpublished".
  publications?: Partial<Record<PublishingPlatform, PublicationStatus>>;
  // Server-managed timestamps (ISO 8601), returned on reads.
  created_at?: string;
  updated_at?: string;
}
