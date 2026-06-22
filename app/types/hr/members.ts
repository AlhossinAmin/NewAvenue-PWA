export type MemberStatus = "Active" | "Inactive" | "On Leave";

export type MemberRole =
  | "CEO"
  | "VP"
  | "Head Of Sales"
  | "Deputy Head of sales"
  | "Senior Sales Manager"
  | "Sales Manger 1"
  | "Sales Manager 2"
  | "Team Leader"
  | "Sales Supervisor";

export interface Member {
  id: string;
  name: string;
  role: MemberRole;
  team: string;
  date_joined: string;
  points: number;
  base_salary: number;
  commission_eligibility: boolean;
  email: string;
  status: MemberStatus;
  salary_mult: number;
  effective_salary: number;
  mobile: string;
  bank_num: string;
  address: string;
  national_id: string;
  current_num_of_leads: number;
}
