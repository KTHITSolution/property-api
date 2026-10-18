# Property API reference

Versioned JSON API. Local base URL: `http://localhost:4000/api/v1`. Requests with a body use `Content-Type: application/json`.

## Authentication and responses

Private routes accept `Authorization: Bearer <accessToken>` or the `accessToken` cookie. Login and registration return a JWT that expires in 30 minutes. Logout responds `204`; clients should discard their token.

Successful JSON responses use `{ "data": ... }`. Lists may also include `meta`. Errors use `{ "error": { "code", "message", "fields?" } }`. Invalid input returns `400 VALIDATION_ERROR`; missing/invalid sessions return `401`; denied ownership returns `403 FORBIDDEN`; missing resources return `404 NOT_FOUND`; duplicate registration returns `409 EMAIL_IN_USE`. Unhandled errors return `500 INTERNAL_ERROR`.

Enums: `city`: `YANGON | MANDALAY`; `intent`: `BUY | SELL | RENT`; `propertyType`: `APARTMENT | HOUSE | CONDO | LAND | OFFICE | SHOP | OTHER`; `currency`: `MMK | THB`. Listing statuses are `DRAFT | PUBLISHED | PAUSED | REJECTED | DELETED`.

## Endpoints

| Method and path | Access | Request | Success |
| --- | --- | --- | --- |
| `GET /health` | Public | — | `200 { data: { status: "ok", service: "property-api" } }` |
| `POST /auth/register` | Public | `{ name, email, password }` | `201 { data: { accessToken, user } }` |
| `POST /auth/login` | Public | `{ email, password }` | `200 { data: { accessToken, user } }` |
| `POST /auth/logout` | Optional auth | — | `204` |
| `GET /auth/me` | User | — | `200 { data: { user } }` |
| `GET /listings` | Public | Search query (below) | `200 { data: Listing[], meta: { page, pageSize, total, totalPages } }` |
| `GET /listings/:listingId` | Public | — | `200 { data: Listing }` |
| `POST /listings` | User | Listing fields (below) | `201 { data: Listing }`; created as draft |
| `PATCH /listings/:listingId` | Owner or admin | Any subset of listing fields | `200 { data: Listing }` |
| `POST /listings/:listingId/publish` | Owner or admin | — | `200 { data: Listing }` |
| `POST /listings/:listingId/pause` | Owner or admin | — | `200 { data: Listing }` |
| `DELETE /listings/:listingId` | Owner or admin | — | `204`; soft-deletes the listing |
| `GET /me/listings` | User | — | `200 { data: Listing[] }`; excludes deleted |
| `GET /me/saved-listings` | User | — | `200 { data: Listing[] }`; published only |
| `POST /listings/:listingId/save` | User | — | `201 { data: { saved: true } }` |
| `DELETE /listings/:listingId/save` | User | — | `204` |
| `POST /listings/:listingId/inquiries` | User | `{ message, contactPreference }` | `201 { data: Inquiry }` |
| `GET /me/inquiries` | User | — | `200 { data: Inquiry[] }` |
| `POST /listings/:listingId/reports` | User | `{ reason, details? }` | `201 { data: Report }` |

`user` contains `id`, `name`, `email`, and `role` (`USER | ADMIN`). Registration requires name 2–80 chars, valid email, and password 8–100 chars. Login errors use `401 INVALID_CREDENTIALS`.

### Listing fields

Required on create: `title` (5–120 chars), `description` (20–5000), `intent`, `propertyType`, `city`, `township` (2–80), positive `priceAmount`, and `currency`. Optional: `addressText` (max 250), integer `bedrooms`/`bathrooms` (0–50), positive `areaValue`, `areaUnit` (max 30), `imageUrls` (up to 20 valid URLs), and `amenities` (up to 20 strings, each 1–60 chars). Patch accepts any subset. Images are replaced when `imageUrls` is supplied; amenities are replaced when `amenities` is supplied.

Listings include their owner (`id`, `name`, and display role `owner | agent`), images, amenities, timestamps, status, and property fields. Public list/detail routes expose published listings only. Owners may edit their own listings; admins may manage any listing. Rejected listings require admin action before publishing.

### Search query

All parameters are optional: `page` (default 1, max 100000), `pageSize` (default 12, max 50), `city`, `intent`, `propertyType`, `currency`, `bedrooms`, `bathrooms`, `minPrice`, `maxPrice`, `minArea`, `maxArea`, `q` (max 120 chars), and `sort` (`newest` default, `price_asc`, `price_desc`). Bedroom and bathroom filters mean at least that many. `q` searches title, description, and township. Minimums cannot exceed maximums.

Inquiry `message` is 10–1000 chars and `contactPreference` is 2–40 chars. Report `reason` is 2–100 chars and optional `details` is max 1000 chars. Inquiries and reports are returned with their database fields, including IDs, status, and timestamps.

## Local setup

See [README.md](README.md) for installation, environment variables, database setup, and scripts. The seed account is for local development only.
