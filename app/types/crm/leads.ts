export type LeadState =
  | "New"
  | "Cold"
  | "Warm"
  | "Hot"
  | "In Progress"
  | "On Hold"
  | "Closed Won"
  | "Closed Lost";

export type OfferingType = "Sale" | "Resale" | "Rent";

export type PropertyType =
  | "Apartment"
  | "Duplex"
  | "Penthouse"
  | "Studio"
  | "Townhouse"
  | "Twin House"
  | "Villa"
  | "Office";

export type SourceType =
  | "Social Media"
  | "Event"
  | "Developer Booth"
  | "Online"
  | "Cold Call"
  | "Walk-In"
  | "Referral";

export type ReferralChannel =
  | "Broker Referral"
  | "Facebook"
  | "WhatsApp"
  | "Instagram"
  | "Google Ads";

// On reads the API returns the linked customer (contact) as a nested object;
// writes still take just the contact UUID (see `LeadInput` in useLeads).
export interface LeadCustomer {
  id: string;
  name: string;
}

// The assigned sales agent (a member); nested on read, a UUID on write.
export interface LeadAgent {
  id: string;
  name: string;
}

export interface Lead {
  id: string;
  customer: LeadCustomer;
  current_state: LeadState;
  offering_type: OfferingType;
  property_type: PropertyType;
  assigned_agent: LeadAgent | null;
  next_follow_up_date: string | null;
  source_type: SourceType;
  referral_channel: ReferralChannel | null;
  campaign_id?: string;
  reference?: string;
  lead_date: string;
  notes: string | null;
  assigned_property: string | null;
  budget: number;
  neighborhood: string;
  district: string;
  num_bedrooms: number;
  additional_customer_notes: string | null;
}
