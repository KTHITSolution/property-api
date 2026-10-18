# API Code Review and Security Audit

Reviewed `property-api` on 2026-10-17. This report records actionable findings from source inspection. No files were changed during the review, and no tests or runtime checks were performed.

## Findings

### High — Public endpoint exposes unpublished listings

[`src/server.ts`](./src/server.ts#L33) excludes only `DELETED` from the public listing detail lookup. Anyone who knows or obtains a listing ID can retrieve drafts, paused listings, and rejected listings, including address, description, images, and owner information.

**Recommendation:** Restrict public detail responses to `PUBLISHED`. If owners or admins need access to other states, provide a separately authorized path.

### High, conditional on production configuration — Predictable JWT fallback secret

[`src/server.ts`](./src/server.ts#L13) silently uses a hard-coded JWT secret when `JWT_SECRET` is missing. Authorization trusts the token's role claim ([`src/server.ts`](./src/server.ts#L19)), so an attacker able to rely on this fallback could forge an admin token and access admin-authorized listing operations.

**Recommendation:** Require a strong, private `JWT_SECRET` outside local development and fail startup if it is missing or invalid.

### Medium — Suspended users can continue using existing tokens

Login rejects suspended users, but [`src/server.ts`](./src/server.ts#L19) does not check current user status or role when accepting a JWT. A token can therefore remain usable for its 30-minute lifetime after the account is suspended or its role changes.

**Recommendation:** Check current account status and role during authorization, or implement token revocation/versioning.

### Medium — Listing updates silently ignore media and amenities

[`src/server.ts`](./src/server.ts#L35) accepts `imageUrls` and `amenities` in PATCH requests, then removes them without applying the changes. The endpoint returns success even though these fields remain unchanged.

**Recommendation:** Persist these changes or reject the fields as unsupported.

### Medium — Listing search query parameters are not validated

[`src/server.ts`](./src/server.ts#L32) casts query strings directly into Prisma enum filters and numeric values. Invalid values can cause generic server errors, and pagination inputs are not consistently constrained.

**Recommendation:** Validate search parameters and return a structured 400 response for invalid values; constrain page and page size explicitly.

### Low — Pagination order is unstable for tied timestamps

[`src/server.ts`](./src/server.ts#L32) sorts by creation time without a unique secondary key. Listings with equal timestamps can shift between pages.

**Recommendation:** Add a unique tie-breaker, such as listing ID, to the order.

### Low — Rejected listings can be published by their owner

[`src/server.ts`](./src/server.ts#L37) allows an owner to publish a listing regardless of its current state. A rejected listing can therefore return to public status without an explicit moderation step.

**Recommendation:** Define allowed status transitions and enforce any required moderation.

## Review scope

- Read-only review of the `property-api` source and schema.
- No tests or runtime checks were run.
- The working tree already had changes in `README.md` and `src/server.ts`; those changes were left untouched.
