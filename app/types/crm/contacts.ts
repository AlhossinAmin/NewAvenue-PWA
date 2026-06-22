import type { PhoneNumber } from "~/constants/common/forms";

export type ContactState = "Cold" | "Active" | "Inactive" | "Converted";

export type Gender = "Male" | "Female";

export interface Contact {
  id: string;
  name: string;
  // One or more mobile numbers, each with its own country dial code.
  mobile_nums: PhoneNumber[];
  email: string;
  gender: Gender;
  age: number;
  current_state: ContactState;
  last_active_lead: string;
  last_activity_date: string;
  date_created: string;
}
