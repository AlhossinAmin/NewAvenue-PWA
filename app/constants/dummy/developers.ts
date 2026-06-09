export type DeveloperStatus = "Active" | "Inactive";

export interface Developer {
  id: string;
  name: string;
  country: string;
  status: DeveloperStatus;
  projects_count: number;
  default_commission: number;
  commission_min: number;
  commission_max: number;
  description: string;
  logo: string;
}

export const DUMMY_DEVELOPERS: Developer[] = [
  {
    id: "b6fc476b-f575-4f37-adae-3223aa296734",
    name: "TLD",
    country: "Egypt",
    status: "Active",
    projects_count: 3,
    default_commission: 4.0,
    commission_min: 4.0,
    commission_max: 5.0,
    description:
      "TLD is a real-estate developer in Egypt with 3 project(s) across Mostakbal City, New Capital, Sahl Hasheesh.",
    logo: "https://www.google.com/s2/favicons?domain=thelanddevelopers.com&sz=128",
  },
  {
    id: "aed895dc-1a9f-44e9-a263-10e8d1d6ed9b",
    name: "Royal Development",
    country: "Egypt",
    status: "Active",
    projects_count: 2,
    default_commission: 4.0,
    commission_min: 4.0,
    commission_max: 4.0,
    description:
      "Royal Development is a real-estate developer in Egypt with 2 project(s) across Mostakbal City, Sixth Settlement.",
    logo: "https://www.google.com/s2/favicons?domain=royaldev.com&sz=128",
  },
  {
    id: "9f67ea22-250e-4e4b-8b1d-8a8e3140c51a",
    name: "Al Ahly Sabbour",
    country: "Egypt",
    status: "Active",
    projects_count: 5,
    default_commission: 4.5,
    commission_min: 4.5,
    commission_max: 4.5,
    description:
      "Al Ahly Sabbour is a real-estate developer in Egypt with 5 project(s) across El Sheikh Zayed, Mostakbal City, New Cairo, North Coast.",
    logo: "https://www.google.com/s2/favicons?domain=alahlysabbour.com&sz=128",
  },
  {
    id: "d919f191-afe0-4a31-92ad-dcdb52f69824",
    name: "Al Qamzi",
    country: "Egypt",
    status: "Active",
    projects_count: 3,
    default_commission: 4.0,
    commission_min: 4.0,
    commission_max: 4.0,
    description:
      "Al Qamzi is a real-estate developer in Egypt with 3 project(s) across Mostakbal City, New Cairo, North coast.",
    logo: "https://www.google.com/s2/favicons?domain=alqamzi.com&sz=128",
  },
  {
    id: "c7378097-bfd8-4971-bdc0-de0086f86594",
    name: "Melee",
    country: "Egypt",
    status: "Active",
    projects_count: 4,
    default_commission: 3.5,
    commission_min: 3.5,
    commission_max: 3.5,
    description:
      "Melee is a real-estate developer in Egypt with 4 project(s) across El Sheikh Zayed, Mostakbal City, North Coast.",
    logo: "https://www.google.com/s2/favicons?domain=melee-development.com&sz=128",
  },
  {
    id: "eda66726-e5a0-4b33-b82b-62d5c9b608be",
    name: "The Waterway Development",
    country: "Egypt",
    status: "Active",
    projects_count: 6,
    default_commission: 3.0,
    commission_min: 3.0,
    commission_max: 4.0,
    description:
      "The Waterway Development is a real-estate developer in Egypt with 6 project(s) across New Cairo, New Capital, North coast.",
    logo: "https://www.google.com/s2/favicons?domain=waterwaydevelopments.com&sz=128",
  },
  {
    id: "c4630e27-6286-47ee-80bc-a3c90d942960",
    name: "Horizon",
    country: "Egypt",
    status: "Active",
    projects_count: 1,
    default_commission: 3.0,
    commission_min: 3.0,
    commission_max: 3.0,
    description:
      "Horizon is a real-estate developer in Egypt with 1 project(s) across New Cairo.",
    logo: "https://www.google.com/s2/favicons?domain=horizon-egy.com&sz=128",
  },
  {
    id: "8e5a2696-add6-4b1d-9c67-541d61b97946",
    name: "City Edge",
    country: "Egypt",
    status: "Active",
    projects_count: 20,
    default_commission: 2.0,
    commission_min: 2.0,
    commission_max: 2.5,
    description:
      "City Edge is a real-estate developer in Egypt with 20 project(s) across Downtown Cairo, El Sheikh Zayed, New Cairo, New Capital, North Coast, North coast.",
    logo: "https://www.google.com/s2/favicons?domain=cityedgedevelopments.com&sz=128",
  },
  {
    id: "b497dc20-25ff-4f2f-ac88-6658de9cff35",
    name: "CRED",
    country: "Egypt",
    status: "Active",
    projects_count: 2,
    default_commission: 4.0,
    commission_min: 4.0,
    commission_max: 4.5,
    description:
      "CRED is a real-estate developer in Egypt with 2 project(s) across 6th October, New Cairo.",
    logo: "https://www.google.com/s2/favicons?domain=creddevelopments.com&sz=128",
  },
];
