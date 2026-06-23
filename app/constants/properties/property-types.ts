import type { PropertyCategory } from "~/types/properties/properties";

// Source of truth for property types, grouped by category. Mirrors the backend
// `config/properties.php` map. The property form uses this to drive the
// category-dependent "Type" select; the lead form lists every type (flat),
// since a lead is not tied to a category.
export const PROPERTY_TYPES_BY_CATEGORY: Record<PropertyCategory, string[]> = {
  Residential: [
    "Apartment",
    "Duplex",
    "Penthouse",
    "Standalone Villa",
    "Twin house",
    "Townhouse",
    "Chalet",
    "Studio",
  ],
  Commercial: [
    "Office Space",
    "Clinic",
    "Retail",
    "Pharmacy",
    "Warehouse",
    "Building",
    "Land",
    "Factory",
    "Hospital",
    "School",
  ],
};

// Every property type across both categories, in display order.
export const ALL_PROPERTY_TYPES: string[] = [
  ...PROPERTY_TYPES_BY_CATEGORY.Residential,
  ...PROPERTY_TYPES_BY_CATEGORY.Commercial,
];
