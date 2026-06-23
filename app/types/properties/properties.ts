import type { MediaItem } from "~/types/common/media";

export type PropertyCategory = "Residential" | "Commercial";

export type TransactionType = "sell" | "rent";

// Human-readable labels for each offering type (the API values are the terse
// "sell" / "rent"). Used by selects, table cells, and filter chips.
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  sell: "For Sale",
  rent: "For Rent",
};

// Where a publication sits in its destination's pipeline: not yet sent,
// awaiting the portal's review, or live.
export type PublicationStatus = "unpublished" | "pending" | "published";

// A publication's destination — one of the supported listing portals, or a
// free-form "other" for any site not in the list.
export type PublicationType =
  | "property_finder"
  | "bayut"
  | "dubizzle"
  | "other";

export interface PublicationTypeMeta {
  value: PublicationType;
  label: string;
  // Iconify name shown next to the destination in selects/previews.
  icon: string;
}

// Ordered list of publication destinations offered in the type dropdown. Extend
// this one array to support another portal.
export const PUBLICATION_TYPES: PublicationTypeMeta[] = [
  {
    value: "property_finder",
    label: "Property Finder",
    icon: "i-lucide-search",
  },
  { value: "bayut", label: "Bayut", icon: "i-lucide-building-2" },
  { value: "dubizzle", label: "Dubizzle", icon: "i-lucide-tag" },
  { value: "other", label: "Other", icon: "i-lucide-globe" },
];

export const PUBLICATION_TYPE_LABELS: Record<PublicationType, string> =
  Object.fromEntries(
    PUBLICATION_TYPES.map((t) => [t.value, t.label]),
  ) as Record<PublicationType, string>;

export const PUBLICATION_TYPE_ICONS: Record<PublicationType, string> =
  Object.fromEntries(PUBLICATION_TYPES.map((t) => [t.value, t.icon])) as Record<
    PublicationType,
    string
  >;

// Select options for the destination dropdown (label + value).
export const PUBLICATION_TYPE_OPTIONS = PUBLICATION_TYPES.map((t) => ({
  label: t.label,
  value: t.value,
}));

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

// A single publication entry — the destination it's posted to, its current
// status there, and the public link to the listing. A property holds a
// repeatable list of these (add/remove rows in the form, like phone numbers).
export interface Publication {
  type: PublicationType;
  status: PublicationStatus;
  link: string;
}

// A blank publication row for a freshly added entry (defaults to Property
// Finder, unpublished, no link yet).
export const createPublication = (): Publication => ({
  type: "property_finder",
  status: "unpublished",
  link: "",
});

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
  // Repeatable list of external listing publications (destination + status +
  // link). May be empty when the property isn't posted anywhere yet.
  publications: Publication[];
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
  // External listing publications — where the property is posted (Property
  // Finder, Bayut, Dubizzle, or "other"), each with its status and link.
  publications?: Publication[];
  // Server-managed timestamps (ISO 8601), returned on reads.
  created_at?: string;
  updated_at?: string;
}
