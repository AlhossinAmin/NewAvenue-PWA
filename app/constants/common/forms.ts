export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "textarea"
  | "select"
  | "multiselect"
  | "switch"
  | "date"
  | "tags"
  | "image"
  | "images"
  // Media-backed photo gallery — uploads each file to the media API and stores
  // an array of `{ id, url }` (submitted as media ids). See PhotosInput.vue.
  | "photos"
  // Media-backed single image — uploads to the media API and stores either the
  // existing URL (from a read), a `{ id, url }`, or null. See PhotoInput.vue.
  | "photo"
  // Repeatable list of phone numbers, each with its own country code dropdown.
  | "phones"
  // Single select that also lets the user type and add a value not in the list.
  | "combobox"
  // Read-only value derived from other fields via `compute`.
  | "computed"
  // Dropdown of actual projects — links a property to a developer project.
  | "project"
  // Dropdown of developers loaded from the API — stores the developer's id.
  | "developer"
  // Dropdown of members (sales agents) loaded from the API — stores member id.
  | "agent"
  // Dropdown of roles loaded from the API — stores the role's name.
  | "role"
  | "contact";

// A single phone entry: a dial-code picked from `COUNTRY_CODE_OPTIONS` plus the
// local number. Contacts hold an array of these (a repeatable "phones" field).
export interface PhoneNumber {
  country_code: string;
  number: string;
}

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
  // For "computed" fields: derive the value from the current form state.
  compute?: (state: Record<string, unknown>) => string;
}

// Dial codes offered in the phone country-code dropdown, Egypt first since it's
// the primary market. Stored as the literal "+code" string on each phone entry.
export const COUNTRY_CODE_OPTIONS: string[] = [
  "+20",
  "+966",
  "+971",
  "+965",
  "+974",
  "+973",
  "+968",
  "+962",
  "+961",
  "+1",
  "+44",
  "+33",
  "+49",
  "+39",
  "+34",
  "+90",
];

// Default dial code for a freshly added phone row (Egypt).
export const DEFAULT_COUNTRY_CODE = "+20";

// Fixed list of districts offered in district comboboxes. Users can still add a
// custom one inline — these are just the common, pre-filled options.
export const DISTRICT_OPTIONS: string[] = [
  "Nasr City",
  "Heliopolis",
  "Maadi",
  "New Cairo",
  "New Administrative Capital",
  "Sheikh Zayed",
  "6th of October City",
  "El Shorouk",
  "Zamalek",
  "Downtown",
  "Mokattam",
];

// Build a blank state object from a field spec (sensible default per type).
export const createEmptyState = (
  fields: FormField[],
): Record<string, unknown> => {
  const state: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.type === "number") state[field.key] = undefined;
    else if (field.type === "switch") state[field.key] = false;
    // null (not "") so a media-single field starts "no logo" and clears cleanly.
    else if (field.type === "photo") state[field.key] = null;
    else if (field.type === "phones")
      // Seed one empty row so the required mobile field shows an input upfront.
      state[field.key] = [{ country_code: DEFAULT_COUNTRY_CODE, number: "" }];
    else if (
      field.type === "tags" ||
      field.type === "multiselect" ||
      field.type === "images" ||
      field.type === "photos"
    )
      state[field.key] = [];
    else state[field.key] = "";
  }
  return state;
};

// Developer, Project and Property forms moved off this data-driven spec to
// explicit per-field markup with a zod schema (see their Form.vue files), so
// they can be laid out and styled directly. The specs below remain for the
// forms still rendered generically via <UForm> + useResourceForm.

export const ROLE_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  {
    key: "tier",
    label: "Tier",
    type: "select",
    options: ["Executive", "Management", "Operational"],
  },
  {
    key: "commission_eligibility",
    label: "Commission eligible",
    type: "switch",
  },
  // Optional parent role (the role this one reports to); stores the role id.
  { key: "parent_role", label: "Reports to", type: "role" },
];

export const MEMBER_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  // Live roles dropdown (resolved by name, validated `exists:roles,name`).
  { key: "role", label: "Role", type: "role", required: true },
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
  { key: "mobile_nums", label: "Mobile", type: "phones", required: true },
  { key: "email", label: "Email", type: "email" },
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
  { key: "mobile_nums", label: "Mobile", type: "phones", required: true },
  { key: "email", label: "Email", type: "email" },
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
  { key: "assigned_agent", label: "Assigned agent", type: "agent" },
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
  { key: "budget", label: "Budget (EGP)", type: "number" },
  { key: "neighborhood", label: "Neighborhood", type: "text" },
  {
    key: "district",
    label: "District",
    type: "combobox",
    options: DISTRICT_OPTIONS,
  },
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
  // Paid-social attribution: only relevant when the lead came from Social Media.
  {
    key: "campaign_id",
    label: "Campaign ID",
    type: "text",
    visibleWhen: { field: "source_type", in: ["Social Media"] },
  },
  {
    key: "reference",
    label: "Reference",
    type: "textarea",
    visibleWhen: { field: "source_type", in: ["Social Media"] },
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
