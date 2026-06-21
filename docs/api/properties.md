# Properties API — Frontend Requirements

The contract the PWA expects from the backend for the **Properties** resource. It
mirrors the existing Projects / Developers resources: a `useApi()` client targeting
`{baseUrl}/api/v1`, bearer-token auth, and the envelope defined in
[types/api.ts](../../app/types/api.ts) (`{ meta, data, pagination }`).

## Endpoints

| Method | Path               | Purpose                          | Returns                   |
| ------ | ------------------ | -------------------------------- | ------------------------- |
| GET    | `/properties`      | Paginated list (search + sort)   | `ApiResponse<Property[]>` |
| GET    | `/properties/{id}` | Single property                  | `ApiResponse<Property>`   |
| POST   | `/properties`      | Create a property                | `ApiResponse<Property>`   |
| PUT    | `/properties/{id}` | Update a property (partial body) | `ApiResponse<Property>`   |

`{id}` is the property UUID.

## List query parameters

Same shape as Projects (`fetchProjects`):

| Param    | Type   | Notes                                                              |
| -------- | ------ | ------------------------------------------------------------------ |
| `page`   | number | 1-based page. Server controls `per_page` (returned in pagination). |
| `search` | string | Free-text match (unit, type, project, district, city, seller…).    |
| `sort`   | string | Field name; `-` prefix = descending, e.g. `-price`. Empty = none.  |

Sortable fields used by the UI: `type`, `area`, `price`, `district`,
`transaction_type`, `delivery_year`, and the relation field `project`.

Pagination follows `ApiPagination` (`current_page`, `per_page`, `total`,
`last_page`, `has_more_pages`).

## Filtering (to be implemented)

The list page previously filtered client-side. Under server-side pagination that
no longer works (it would only filter the current page), so filtering must move to
the API. All filters are **optional**, combine with **AND**, and stack on top of
`search` / `sort` / `page`. Applying or changing any filter resets `page` to 1.

### Filter query parameters on `GET /properties`

| Param              | Type            | Matches                                                 |
| ------------------ | --------------- | ------------------------------------------------------- |
| `category`         | string[]        | `category` ∈ values (`Residential`, `Commercial`)       |
| `type`             | string[]        | `type` ∈ values (`Apartment`, `Villa`, `Shop`, …)       |
| `transaction_type` | string[]        | `transaction_type` ∈ values (`Primary`/`Resale`/`Rent`) |
| `project`          | string[] (uuid) | `project.id` ∈ values                                   |
| `district`         | string[]        | `district` ∈ values                                     |
| `num_bedrooms`     | number[]        | `num_bedrooms` ∈ values                                 |
| `area_min`         | number          | `area >= area_min` (m²)                                 |
| `area_max`         | number          | `area <= area_max` (m²)                                 |
| `price_min`        | number          | `price >= price_min` (EGP)                              |
| `price_max`        | number          | `price <= price_max` (EGP)                              |

**Multi-value encoding:** array params are sent as repeated keys, e.g.
`?category=Residential&category=Commercial`. An empty / omitted param means "no
constraint on that field". A select filter with multiple values is an **OR within
the field** (any of the selected values), and **AND across fields**.

Example:
`GET /properties?page=1&transaction_type=Resale&transaction_type=Rent&district=New%20Cairo&price_min=5000000&price_max=20000000&sort=-price`

### Facets endpoint — `GET /properties/filters`

Server-side select filters need their option lists from the server (a single page
can't reveal every distinct value), and the range filters need real bounds.

| Method | Path                  | Returns                       |
| ------ | --------------------- | ----------------------------- |
| GET    | `/properties/filters` | `ApiResponse<PropertyFacets>` |

```jsonc
{
  "type": ["Apartment", "Duplex", "Penthouse", "Shop", "Villa", "…"],
  "district": ["New Cairo", "El Sheikh Zayed", "North Coast", "…"],
  "num_bedrooms": [0, 1, 2, 3, 4, 5, 6],
  "project": [{ "id": "uuid", "name": "Sky Gardens" }, "…"], // id + label
  "area": { "min": 47, "max": 563 }, // m² bounds for the range slider
  "price": { "min": 2137041, "max": 36966662 }, // EGP bounds for the slider
}
```

Notes:

- `category` and `transaction_type` are fixed enums already known to the client —
  the backend does not need to return them as facets (it may, for completeness).
- Facets should reflect the **full dataset**, not the current filter selection
  (so options don't disappear as the user narrows down). If the backend prefers
  contextual facets (counts that update with the active filters) that's a future
  enhancement — flag it so the UI can show counts.
- The frontend would add `fetchPropertyFacets()` to `useProperties` and feed the
  result into `DataView`'s `filterFields` (`select` options + `range`/`slider`
  bounds), then translate the chosen filter values into the query params above.

## Read shape (`Property`)

Defined in [constants/dummy/properties.ts](../../app/constants/dummy/properties.ts).
The linked **project** and **developer** are returned as nested objects (same
convention as a project's `developer`):

```jsonc
{
  "id": "uuid",
  "unit_num": "D18-32", // unit code (server-formatted)
  "floor_num": 18,
  "project": { "id": "uuid", "name": "Sky Gardens" }, // nested relation
  "developer": { "id": "uuid", "name": "City Edge" }, // nested relation
  "category": "Residential", // Residential | Commercial
  "type": "Duplex",
  "transaction_type": "Rent", // Primary | Resale | Rent
  "seller_name": "Hany Zaki", // present for Resale/Rent (no linked project)
  "price": 8717655, // EGP, integer
  "commission_scheme": 2.5, // percent
  "country": "Egypt",
  "city": "Giza",
  "district": "El Sheikh Zayed",
  "area": 386, // m²
  "delivery_year": 2028,
  "description": "…",
  "latitude": 30.021093,
  "longtitude": 31.004626,
  "amenities": ["Central AC", "…"],
  "num_bedrooms": 5,
  "num_bathrooms": 5,
  "compound": "Etapa",
  "street": "Plot 266, El Sheikh Zayed",
  "featured_photo": "https://…",
  "other_photos": "https://…|null",

  // Installment plan — present only when the unit offers installments.
  "installments_available": true,
  "num_installments": 48,
  "installment_value": 181618, // EGP per installment, integer
}
```

## Write shape (`PropertyInput`)

On create/update the relations are sent as **UUID strings**, not nested objects
(symmetry with `ProjectInput.developer`):

```ts
type PropertyInput = Omit<Property, "id" | "project" | "developer"> & {
  project?: string; // required when transaction_type === "Primary"
  developer?: string; // the unit's developer (derived from project for Primary)
};
```

Field rules the form ([constants/forms.ts](../../app/constants/forms.ts) →
`PROPERTY_FIELDS`) already enforces and the API should validate:

- `category`, `type`, `transaction_type`, `price` are **required**.
- `project` is **required** and `seller_name` is **omitted** when
  `transaction_type === "Primary"`; for `Resale` / `Rent` the inverse holds
  (`seller_name` required, `project` omitted).
- `unit_num` is derived from the building / floor / unit number parts; the server
  is the source of truth for the final formatted code.
- `num_installments` / `installment_value` are only meaningful when
  `installments_available` is `true`.
- `PUT` accepts a partial body (only changed fields).

## Errors

Non-2xx responses use the `meta.error` envelope (`{ code, message, stack }`).
The UI surfaces a toast on failure; unknown `GET /properties/{id}` ids should
return 404 so the edit page can show its "not found" state.
