export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "textarea"
  | "select"
  | "switch"
  | "date"
  | "tags"
  | "contact";

export interface FormField {
  key: string;
  label: string;
  type: FormFieldType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  full?: boolean;
  // When set, the field is only shown/validated while the referenced field's
  // value is one of `in`. Used for mutually-exclusive fields (e.g. a property's
  // project vs. seller name, depending on the offering type).
  visibleWhen?: { field: string; in: string[] };
}

// Build a blank state object from a field spec (sensible default per type).
export const createEmptyState = (fields: FormField[]): Record<string, unknown> => {
  const state: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.type === "number") state[field.key] = undefined;
    else if (field.type === "switch") state[field.key] = false;
    else if (field.type === "tags") state[field.key] = [];
    else state[field.key] = "";
  }
  return state;
}

export const DEVELOPER_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "country", label: "Country", type: "text", required: true },
  {
    key: "agreement",
    label: "Agreement",
    type: "select",
    options: ["Signed", "Pending", "Expired"],
  },
  { key: "projects_count", label: "Projects count", type: "number" },
  { key: "num_deals", label: "Number of deals", type: "number" },
  {
    key: "default_commission",
    label: "Default commission (%)",
    type: "number",
  },
  { key: "commission_min", label: "Commission min (%)", type: "number" },
  { key: "commission_max", label: "Commission max (%)", type: "number" },
  { key: "logo", label: "Logo URL", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
];

export const PROJECT_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "developer", label: "Developer", type: "text", required: true },
  { key: "country", label: "Country", type: "text" },
  { key: "city", label: "City", type: "text" },
  { key: "district", label: "District", type: "text" },
  {
    key: "category",
    label: "Category",
    type: "select",
    options: [
      "Residential",
      "Administrative",
      "Retail",
      "Commercial",
      "Mixed-Use",
    ],
    required: true,
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      "Selling",
      "Pre-Launch",
      "Under Construction",
      "Delivered",
      "Sold Out",
    ],
    required: true,
  },
  { key: "commission_scheme", label: "Commission (%)", type: "number" },
  { key: "total_units", label: "Total units", type: "number" },
  { key: "units_sold", label: "Units sold", type: "number" },
  { key: "units_remaining", label: "Units remaining", type: "number" },
  { key: "featured_photo", label: "Featured photo URL", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
];

export const PROPERTY_FIELDS: FormField[] = [
  { key: "unit_num", label: "Unit number", type: "text", required: true },
  { key: "floor_num", label: "Floor", type: "number" },
  { key: "compound", label: "Compound", type: "text", required: true },
  {
    key: "category",
    label: "Category",
    type: "select",
    options: ["Residential", "Commercial"],
    required: true,
  },
  { key: "type", label: "Type", type: "text", required: true },
  {
    key: "transaction_type",
    label: "Offering type",
    type: "select",
    options: ["Primary", "Resale", "Rent"],
    required: true,
  },
  // Mutually exclusive: a Primary offering is tied to a developer project,
  // while Resale/Rent offerings come from an individual seller. Only the field
  // matching the offering type is shown — the other stays empty in the backend.
  {
    key: "project",
    label: "Project",
    type: "text",
    required: true,
    visibleWhen: { field: "transaction_type", in: ["Primary"] },
  },
  {
    key: "seller_name",
    label: "Seller name",
    type: "text",
    required: true,
    visibleWhen: { field: "transaction_type", in: ["Resale", "Rent"] },
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: ["Available", "Reserved", "Sold"],
    required: true,
  },
  { key: "price", label: "Price (EGP)", type: "number", required: true },
  { key: "commission_scheme", label: "Commission (%)", type: "number" },
  { key: "country", label: "Country", type: "text" },
  { key: "city", label: "City", type: "text" },
  { key: "district", label: "District", type: "text" },
  { key: "area", label: "Area (m²)", type: "number" },
  { key: "delivery_year", label: "Delivery year", type: "number" },
  { key: "num_bedrooms", label: "Bedrooms", type: "number" },
  { key: "num_bathrooms", label: "Bathrooms", type: "number" },
  { key: "street", label: "Street", type: "text" },
  { key: "amenities", label: "Amenities", type: "tags" },
  { key: "description", label: "Description", type: "textarea" },
];

export const MEMBER_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "role", label: "Role", type: "text", required: true },
  { key: "team", label: "Team", type: "text" },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "mobile", label: "Mobile", type: "tel" },
  { key: "date_joined", label: "Date joined", type: "date" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: ["Active", "Inactive", "On Leave"],
    required: true,
  },
  { key: "points", label: "Points", type: "number" },
  { key: "current_num_of_leads", label: "Current leads", type: "number" },
  { key: "base_salary", label: "Base salary (EGP)", type: "number" },
  { key: "salary_mult", label: "Salary multiplier", type: "number" },
  { key: "effective_salary", label: "Effective salary (EGP)", type: "number" },
  {
    key: "commission_eligibility",
    label: "Commission eligible",
    type: "switch",
  },
  { key: "bank_num", label: "Bank number", type: "text" },
  { key: "national_id", label: "National ID", type: "text" },
  { key: "address", label: "Address", type: "text", full: true },
];

export const CONTACT_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "mobile_num", label: "Mobile", type: "tel", required: true },
  { key: "email", label: "Email", type: "email", required: true },
  {
    key: "gender",
    label: "Gender",
    type: "select",
    options: ["Male", "Female"],
  },
  { key: "age", label: "Age", type: "number" },
  {
    key: "current_state",
    label: "State",
    type: "select",
    options: ["Active", "Cold", "Inactive", "Converted"],
    required: true,
  },
  { key: "last_activity_date", label: "Last activity date", type: "date" },
  { key: "date_created", label: "Date created", type: "date" },
];

// Minimal field set for creating a contact inline (e.g. on the fly from
// the lead form). Mirrors CONTACT_FIELDS but drops the auto-managed dates.
export const QUICK_CONTACT_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "mobile_num", label: "Mobile", type: "tel", required: true },
  { key: "email", label: "Email", type: "email", required: true },
  {
    key: "gender",
    label: "Gender",
    type: "select",
    options: ["Male", "Female"],
  },
  { key: "age", label: "Age", type: "number" },
  {
    key: "current_state",
    label: "State",
    type: "select",
    options: ["Active", "Cold", "Inactive", "Converted"],
    required: true,
  },
];

export const LEAD_FIELDS: FormField[] = [
  { key: "customer", label: "Customer", type: "contact", required: true },
  { key: "assigned_agent", label: "Assigned agent", type: "text" },
  {
    key: "current_state",
    label: "State",
    type: "select",
    options: [
      "New",
      "Cold",
      "Warm",
      "Hot",
      "In Progress",
      "On Hold",
      "Closed Won",
      "Closed Lost",
    ],
    required: true,
  },
  {
    key: "offering_type",
    label: "Offering type",
    type: "select",
    options: ["Sale", "Resale", "Rent"],
    required: true,
  },
  {
    key: "property_type",
    label: "Property type",
    type: "select",
    options: [
      "Apartment",
      "Duplex",
      "Penthouse",
      "Studio",
      "Townhouse",
      "Twin House",
      "Villa",
      "Office",
    ],
    required: true,
  },
  {
    key: "segment",
    label: "Segment",
    type: "select",
    options: ["Affordable", "Middle", "Upper Middle", "Luxury", "Ultra Luxury"],
  },
  { key: "budget", label: "Budget (EGP)", type: "number" },
  { key: "pref_location", label: "Preferred location", type: "text" },
  { key: "num_bedrooms", label: "Bedrooms", type: "number" },
  {
    key: "source_type",
    label: "Source",
    type: "select",
    options: [
      "Social Media",
      "Event",
      "Developer Booth",
      "Online",
      "Cold Call",
      "Walk-In",
      "Referral",
    ],
  },
  {
    key: "referral_channel",
    label: "Referral channel",
    type: "select",
    options: [
      "Broker Referral",
      "Facebook",
      "WhatsApp",
      "Instagram",
      "Google Ads",
    ],
  },
  { key: "lead_date", label: "Lead date", type: "date" },
  { key: "next_follow_up_date", label: "Next follow-up", type: "date" },
  { key: "notes", label: "Notes", type: "textarea" },
  {
    key: "additional_customer_notes",
    label: "Additional customer notes",
    type: "textarea",
  },
];
