export type RoleTier = "Executive" | "Management" | "Operational";

export interface Role {
  id: string;
  name: string;
  tier: RoleTier | null;
  commission_eligibility: boolean;
  // Number of members assigned this role (server-derived).
  num_of_members: number;
  // The parent role's id (null = top-level). Sent as `parent_role` on write.
  parent_role: string | null;
  // A direct child role's id — derived from the hierarchy, read-only.
  child_role: string | null;
}
