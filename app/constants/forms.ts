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
  // Repeatable list of phone numbers, each with its own country code dropdown.
  | "phones"
  // Single select that also lets the user type and add a value not in the list.
  | "combobox"
  // Read-only value derived from other fields via `compute`.
  | "computed"
  // Dropdown of actual projects — links a property to a developer project.
  | "project"
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

// Derive a unit code from its parts, e.g. Duplex / Building 5 / Floor 2 /
// Unit 13 -> "D5-2-13". Returns "" until the numeric parts are filled in.
const computeUnitCode = (state: Record<string, unknown>): string => {
  const filled = (v: unknown) => v !== undefined && v !== null && v !== "";
  const building = state.building_num;
  const floor = state.floor_num;
  const unit = state.unit_number;
  if (!filled(building) || !filled(floor) || !filled(unit)) return "";
  const type = String(state.type ?? "").trim();
  const prefix = type ? type[0]!.toUpperCase() : "";
  return `${prefix}${building}-${floor}-${unit}`;
};

// Build a blank state object from a field spec (sensible default per type).
export const createEmptyState = (
  fields: FormField[],
): Record<string, unknown> => {
  const state: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.type === "number") state[field.key] = undefined;
    else if (field.type === "switch") state[field.key] = false;
    else if (field.type === "phones")
      // Seed one empty row so the required mobile field shows an input upfront.
      state[field.key] = [{ country_code: DEFAULT_COUNTRY_CODE, number: "" }];
    else if (
      field.type === "tags" ||
      field.type === "multiselect" ||
      field.type === "images"
    )
      state[field.key] = [];
    else state[field.key] = "";
  }
  return state;
};

export const DEVELOPER_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "country", label: "Country", type: "text", required: true },
  {
    key: "agreement",
    label: "Agreement",
    type: "select",
    options: ["Signed", "Pending", "Expired"],
  },
  { key: "agreement_end_date", label: "Agreement end date", type: "date" },
  { key: "projects_count", label: "Projects count", type: "number" },
  { key: "num_deals", label: "Number of deals", type: "number" },
  {
    key: "default_commission",
    label: "Default commission (%)",
    type: "number",
  },
  { key: "commission_min", label: "Commission min (%)", type: "number" },
  { key: "commission_max", label: "Commission max (%)", type: "number" },
  { key: "logo", label: "Logo", type: "image" },
  { key: "description", label: "Description", type: "textarea" },
];

export const PROJECT_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "developer", label: "Developer", type: "text", required: true },
  { key: "country", label: "Country", type: "text" },
  { key: "city", label: "City", type: "text" },
  {
    key: "district",
    label: "District",
    type: "combobox",
    options: DISTRICT_OPTIONS,
  },
  {
    key: "category",
    label: "Category",
    type: "multiselect",
    options: ["Residential", "Administrative", "Retail", "Commercial", "Mixed"],
    required: true,
  },
  { key: "commission_scheme", label: "Commission (%)", type: "number" },
  { key: "total_units", label: "Total units", type: "number" },
  { key: "units_sold", label: "Units sold", type: "number" },
  { key: "units_remaining", label: "Units remaining", type: "number" },
  { key: "photos", label: "Photos", type: "images", full: true },
  { key: "description", label: "Description", type: "textarea" },
];

export const PROPERTY_FIELDS: FormField[] = [
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
  // Formerly "Compound". A Primary unit links to an actual developer project
  // (selected from the projects list). Resale/Rent offerings have no linked
  // project — an individual seller is named instead — so this is hidden then.
  {
    key: "project",
    label: "Project",
    type: "project",
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
  // Unit identity: the three numeric parts plus the property type feed the
  // read-only "Unit" code below.
  {
    key: "building_num",
    label: "Building number",
    type: "number",
    required: true,
  },
  { key: "floor_num", label: "Floor number", type: "number", required: true },
  { key: "unit_number", label: "Unit number", type: "number", required: true },
  {
    key: "unit_num",
    label: "Unit",
    type: "computed",
    compute: computeUnitCode,
  },
  {
    key: "installments_available",
    label: "Installments available",
    type: "switch",
  },
  {
    key: "num_installments",
    label: "Number of installments",
    type: "number",
    visibleWhen: { field: "installments_available", in: ["true"] },
  },
  {
    key: "installment_value",
    label: "Installment value (EGP)",
    type: "number",
    visibleWhen: { field: "installments_available", in: ["true"] },
  },
  { key: "price", label: "Price (EGP)", type: "number", required: true },
  { key: "commission_scheme", label: "Commission (%)", type: "number" },
  { key: "country", label: "Country", type: "text" },
  { key: "city", label: "City", type: "text" },
  {
    key: "district",
    label: "District",
    type: "combobox",
    options: DISTRICT_OPTIONS,
  },
  { key: "neighborhood", label: "Neighborhood", type: "text" },
  { key: "street", label: "Street", type: "text" },
  // Core area sections. A conditional garden-area section (for standalone /
  // ground-floor units) is pending spec details from New Avenue.
  { key: "area", label: "Total area (m²)", type: "number" },
  { key: "built_up_area", label: "Built-up area (m²)", type: "number" },
  { key: "delivery_year", label: "Delivery year", type: "number" },
  { key: "num_bedrooms", label: "Bedrooms", type: "number" },
  { key: "num_bathrooms", label: "Bathrooms", type: "number" },
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
