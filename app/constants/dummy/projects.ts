export type ProjectStatus =
  | "Selling"
  | "Pre-Launch"
  | "Under Construction"
  | "Delivered"
  | "Sold Out";

export type ProjectCategory =
  | "Residential"
  | "Administrative"
  | "Retail"
  | "Commercial"
  | "Mixed-Use";

export interface Project {
  id: string;
  name: string;
  developer: string;
  country: string;
  city: string;
  district: string;
  category: ProjectCategory;
  commission_scheme: number;
  units_remaining: number;
  status: ProjectStatus;
  total_units: number;
  units_sold: number;
  description: string;
  featured_photo: string;
  other_photos: string | null;
}

export const DUMMY_PROJECTS: Project[] = [
  {
    id: "7182072b-30c4-41d3-a7a3-587a5e05ced7",
    name: "Sky Gardens",
    developer: "Mountain View",
    country: "Egypt",
    city: "Cairo",
    district: "Nasr City",
    category: "Residential",
    commission_scheme: 4.25,
    units_remaining: 43,
    status: "Pre-Launch",
    total_units: 180,
    units_sold: 137,
    description:
      "Sky Gardens is a residential development located in Nasr City.",
    featured_photo:
      "https://cdn.example.com/properties/sky-gardens/featured.jpg",
    other_photos: "https://cdn.example.com/properties/sky-gardens/gallery.zip",
  },
  {
    id: "6bade7f8-4ee4-4d01-ace7-2af80d2fbad6",
    name: "Crystal Heights",
    developer: "Emaar Misr",
    country: "Egypt",
    city: "Giza",
    district: "Sheikh Zayed",
    category: "Mixed-Use",
    commission_scheme: 4.15,
    units_remaining: 529,
    status: "Selling",
    total_units: 600,
    units_sold: 71,
    description:
      "Crystal Heights is a mixed-use development located in Sheikh Zayed.",
    featured_photo:
      "https://cdn.example.com/properties/crystal-heights/featured.jpg",
    other_photos: null,
  },
  {
    id: "a598620b-9fe5-4bfa-8b6f-f1cfb0a16b1f",
    name: "Stone Residence",
    developer: "Talaat Moustafa Group",
    country: "Egypt",
    city: "Cairo",
    district: "New Administrative Capital",
    category: "Residential",
    commission_scheme: 5.43,
    units_remaining: 1,
    status: "Delivered",
    total_units: 1200,
    units_sold: 1199,
    description:
      "Stone Residence is a residential development located in New Administrative Capital.",
    featured_photo:
      "https://cdn.example.com/properties/stone-residence/featured.jpg",
    other_photos: null,
  },
  {
    id: "5f819ed6-0942-45d8-bdb4-f0479ab71989",
    name: "Royal Towers",
    developer: "LMD",
    country: "Egypt",
    city: "Cairo",
    district: "Nasr City",
    category: "Retail",
    commission_scheme: 4.95,
    units_remaining: 780,
    status: "Under Construction",
    total_units: 900,
    units_sold: 120,
    description: "Royal Towers is a retail development located in Nasr City.",
    featured_photo:
      "https://cdn.example.com/properties/royal-towers/featured.jpg",
    other_photos: null,
  },
  {
    id: "01c5b0b8-b10a-42ec-a069-b67bc42704b4",
    name: "Stone Hills",
    developer: "Marakez",
    country: "Egypt",
    city: "Cairo",
    district: "New Administrative Capital",
    category: "Administrative",
    commission_scheme: 2.68,
    units_remaining: 40,
    status: "Pre-Launch",
    total_units: 180,
    units_sold: 140,
    description:
      "Stone Hills is a administrative development located in New Administrative Capital.",
    featured_photo:
      "https://cdn.example.com/properties/stone-hills/featured.jpg",
    other_photos: null,
  },
  {
    id: "533b5b4e-a6ea-4795-8f07-61c5123a995b",
    name: "Silver Park",
    developer: "Mountain View",
    country: "Egypt",
    city: "Cairo",
    district: "Nasr City",
    category: "Administrative",
    commission_scheme: 3.4,
    units_remaining: 151,
    status: "Delivered",
    total_units: 750,
    units_sold: 599,
    description:
      "Silver Park is a administrative development located in Nasr City.",
    featured_photo:
      "https://cdn.example.com/properties/silver-park/featured.jpg",
    other_photos: "https://cdn.example.com/properties/silver-park/gallery.zip",
  },
  {
    id: "f02c0ebf-532c-4e27-9f28-6ba73e82ac73",
    name: "Vista Plaza",
    developer: "Tatweer Misr",
    country: "Egypt",
    city: "Giza",
    district: "Sheikh Zayed",
    category: "Administrative",
    commission_scheme: 3.85,
    units_remaining: 394,
    status: "Under Construction",
    total_units: 900,
    units_sold: 506,
    description:
      "Vista Plaza is a administrative development located in Sheikh Zayed.",
    featured_photo:
      "https://cdn.example.com/properties/vista-plaza/featured.jpg",
    other_photos: "https://cdn.example.com/properties/vista-plaza/gallery.zip",
  },
  {
    id: "b5360155-7c24-4f26-a9b2-d033efc5fa0e",
    name: "Green Residence",
    developer: "Hassan Allam Properties",
    country: "Egypt",
    city: "Cairo",
    district: "Nasr City",
    category: "Retail",
    commission_scheme: 2.62,
    units_remaining: 403,
    status: "Delivered",
    total_units: 480,
    units_sold: 77,
    description:
      "Green Residence is a retail development located in Nasr City.",
    featured_photo:
      "https://cdn.example.com/properties/green-residence/featured.jpg",
    other_photos:
      "https://cdn.example.com/properties/green-residence/gallery.zip",
  },
  {
    id: "269a467c-3ece-47f6-9865-a043da4330a1",
    name: "Palm Hills",
    developer: "Marakez",
    country: "Egypt",
    city: "Cairo",
    district: "Heliopolis",
    category: "Administrative",
    commission_scheme: 4.89,
    units_remaining: 176,
    status: "Delivered",
    total_units: 480,
    units_sold: 304,
    description:
      "Palm Hills is a administrative development located in Heliopolis.",
    featured_photo:
      "https://cdn.example.com/properties/palm-hills/featured.jpg",
    other_photos: null,
  },
  {
    id: "0fa5febb-7a83-4538-a4df-56fc8aa22a10",
    name: "Green Towers",
    developer: "Redcon",
    country: "Egypt",
    city: "Cairo",
    district: "El Shorouk",
    category: "Residential",
    commission_scheme: 4.23,
    units_remaining: 27,
    status: "Under Construction",
    total_units: 120,
    units_sold: 93,
    description:
      "Green Towers is a residential development located in El Shorouk.",
    featured_photo:
      "https://cdn.example.com/properties/green-towers/featured.jpg",
    other_photos: "https://cdn.example.com/properties/green-towers/gallery.zip",
  },
  {
    id: "3d02cc34-0946-4bf9-93e8-6b7b23b0e467",
    name: "Lake Towers",
    developer: "Mountain View",
    country: "Egypt",
    city: "Cairo",
    district: "Nasr City",
    category: "Administrative",
    commission_scheme: 3.0,
    units_remaining: 0,
    status: "Sold Out",
    total_units: 120,
    units_sold: 120,
    description:
      "Lake Towers is a administrative development located in Nasr City.",
    featured_photo:
      "https://cdn.example.com/properties/lake-towers/featured.jpg",
    other_photos: null,
  },
  {
    id: "16b438d2-2368-44e1-8a42-db730ed1b24a",
    name: "Grand Plaza",
    developer: "Misr Italia",
    country: "Egypt",
    city: "Cairo",
    district: "Maadi",
    category: "Retail",
    commission_scheme: 2.74,
    units_remaining: 97,
    status: "Delivered",
    total_units: 300,
    units_sold: 203,
    description: "Grand Plaza is a retail development located in Maadi.",
    featured_photo:
      "https://cdn.example.com/properties/grand-plaza/featured.jpg",
    other_photos: "https://cdn.example.com/properties/grand-plaza/gallery.zip",
  },
  {
    id: "57da24bd-1abc-4482-bf60-6870cb946b03",
    name: "Palm Towers",
    developer: "Mountain View",
    country: "Egypt",
    city: "Giza",
    district: "6th of October City",
    category: "Mixed-Use",
    commission_scheme: 4.55,
    units_remaining: 615,
    status: "Delivered",
    total_units: 900,
    units_sold: 285,
    description:
      "Palm Towers is a mixed-use development located in 6th of October City.",
    featured_photo:
      "https://cdn.example.com/properties/palm-towers/featured.jpg",
    other_photos: "https://cdn.example.com/properties/palm-towers/gallery.zip",
  },
  {
    id: "e33b78bc-6b8b-4c87-90f9-83ebfa15e783",
    name: "Crystal Gardens",
    developer: "Talaat Moustafa Group",
    country: "Egypt",
    city: "Giza",
    district: "Sheikh Zayed",
    category: "Retail",
    commission_scheme: 3.95,
    units_remaining: 181,
    status: "Selling",
    total_units: 240,
    units_sold: 59,
    description:
      "Crystal Gardens is a retail development located in Sheikh Zayed.",
    featured_photo:
      "https://cdn.example.com/properties/crystal-gardens/featured.jpg",
    other_photos:
      "https://cdn.example.com/properties/crystal-gardens/gallery.zip",
  },
  {
    id: "aae02b04-4127-44dd-a7c1-a5b49ffb7e26",
    name: "Park Towers",
    developer: "Marakez",
    country: "Egypt",
    city: "Cairo",
    district: "New Cairo",
    category: "Retail",
    commission_scheme: 4.2,
    units_remaining: 53,
    status: "Under Construction",
    total_units: 600,
    units_sold: 547,
    description: "Park Towers is a retail development located in New Cairo.",
    featured_photo:
      "https://cdn.example.com/properties/park-towers/featured.jpg",
    other_photos: "https://cdn.example.com/properties/park-towers/gallery.zip",
  },
  {
    id: "2b11e817-c5cc-4ee8-a1f2-f179e53a8da5",
    name: "Vista Park",
    developer: "Hassan Allam Properties",
    country: "Egypt",
    city: "Cairo",
    district: "New Cairo",
    category: "Mixed-Use",
    commission_scheme: 3.68,
    units_remaining: 499,
    status: "Delivered",
    total_units: 900,
    units_sold: 401,
    description: "Vista Park is a mixed-use development located in New Cairo.",
    featured_photo:
      "https://cdn.example.com/properties/vista-park/featured.jpg",
    other_photos: "https://cdn.example.com/properties/vista-park/gallery.zip",
  },
  {
    id: "f17ebdd0-75bc-4561-89c2-30aabbae9c4e",
    name: "Sun Heights",
    developer: "Emaar Misr",
    country: "Egypt",
    city: "Cairo",
    district: "New Administrative Capital",
    category: "Residential",
    commission_scheme: 3.52,
    units_remaining: 75,
    status: "Selling",
    total_units: 300,
    units_sold: 225,
    description:
      "Sun Heights is a residential development located in New Administrative Capital.",
    featured_photo:
      "https://cdn.example.com/properties/sun-heights/featured.jpg",
    other_photos: null,
  },
  {
    id: "81cca3df-0521-41d1-a429-a5f285b08176",
    name: "Grand Hills",
    developer: "Emaar Misr",
    country: "Egypt",
    city: "Giza",
    district: "6th of October City",
    category: "Residential",
    commission_scheme: 5.12,
    units_remaining: 166,
    status: "Pre-Launch",
    total_units: 480,
    units_sold: 314,
    description:
      "Grand Hills is a residential development located in 6th of October City.",
    featured_photo:
      "https://cdn.example.com/properties/grand-hills/featured.jpg",
    other_photos: "https://cdn.example.com/properties/grand-hills/gallery.zip",
  },
  {
    id: "f90a5495-85d8-49d3-808f-4de76490af5e",
    name: "Royal Gate",
    developer: "Emaar Misr",
    country: "Egypt",
    city: "Cairo",
    district: "Maadi",
    category: "Administrative",
    commission_scheme: 2.85,
    units_remaining: 455,
    status: "Delivered",
    total_units: 1200,
    units_sold: 745,
    description: "Royal Gate is a administrative development located in Maadi.",
    featured_photo:
      "https://cdn.example.com/properties/royal-gate/featured.jpg",
    other_photos: "https://cdn.example.com/properties/royal-gate/gallery.zip",
  },
  {
    id: "811eafb9-aa3c-4fd1-bf7f-b0930865f50c",
    name: "Lake View",
    developer: "Tatweer Misr",
    country: "Egypt",
    city: "Cairo",
    district: "El Shorouk",
    category: "Administrative",
    commission_scheme: 3.53,
    units_remaining: 144,
    status: "Pre-Launch",
    total_units: 180,
    units_sold: 36,
    description:
      "Lake View is a administrative development located in El Shorouk.",
    featured_photo: "https://cdn.example.com/properties/lake-view/featured.jpg",
    other_photos: null,
  },
];
