export type AgreementStatus = "Signed" | "Pending" | "Expired";

export interface Developer {
  id: string;
  name: string;
  country: string;
  agreement: AgreementStatus;
  agreement_end_date: string;
  projects_count: number;
  num_deals: number;
  default_commission: number;
  commission_min: number;
  commission_max: number;
  description: string;
  // Read shape: the logo's media URL, or null when unset. On writes a media id
  // is sent instead (see `DeveloperInput` in useDevelopers).
  logo: string | null;
}
