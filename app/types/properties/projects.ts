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
  photos: string[];
}
