import type { MediaItem } from "~/types/common/media";

export type ProjectCategory =
  | "Residential"
  | "Administrative"
  | "Retail"
  | "Commercial"
  | "Mixed";

// On reads the API returns the developer as a nested object; writes still take
// just the developer's UUID (see `ProjectInput` in useProjects).
export interface ProjectDeveloper {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  developer: ProjectDeveloper;
  country: string;
  city: string;
  district: string;
  category: ProjectCategory[];
  commission_scheme: number;
  resale_units_remaining: number;
  total_resale_units: number;
  resale_units_sold: number;
  description: string;
  // Read shape of the `photos` media collection — `{ id, url }` objects. On
  // writes only the ids are sent (see `ProjectInput` in useProjects).
  photos: MediaItem[];
}
