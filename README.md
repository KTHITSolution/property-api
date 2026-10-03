# Property API

The HTTP API and database service for Property Portal. It owns the Prisma schema and SQLite database; browser and future mobile clients communicate with it through the versioned `/api/v1` contract.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

Create a local environment file, install dependencies, generate Prisma Client, apply the development migration, seed sample data, and start the API:

```sh
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

On PowerShell, copy the environment file with:

```powershell
Copy-Item .env.example .env
```

The server runs at `http://localhost:4000` by default. Health check: `GET http://localhost:4000/api/v1/health`.

The seed creates a demo account: `demo@property.test` / `Password123!`. Use it only for local development.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with reload on source changes |
| `npm run typecheck` | Run TypeScript checks |
| `npm test` | Run Vitest tests |
| `npm run build` | Compile the service to `dist/` |
| `npm start` | Run the compiled service |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Create/apply a development migration |
| `npm run db:seed` | Seed local demo data |

## API areas

- `GET /api/v1/health`
- `/api/v1/auth/*` — registration, login, logout, current user
- `/api/v1/listings` — public search/details and authenticated listing management
- `/api/v1/me/saved-listings` — saved listings
- `/api/v1/listings/:listingId/save` — save/unsave a listing
- `/api/v1/listings/:listingId/inquiries` and `/api/v1/me/inquiries` — inquiries
- `/api/v1/listings/:listingId/reports` — listing reports

The API validates request bodies with Zod, enforces ownership and role checks server-side, and exposes JSON responses. Do not connect clients directly to `dev.db` or Prisma.

Product behavior is described in the repository-level [`SPEC.md`](../SPEC.md); stable engineering guidance is in [`AGENTS.md`](../AGENTS.md).
