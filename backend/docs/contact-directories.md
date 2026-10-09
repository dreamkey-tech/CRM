# Owners, brokers, and property contacts

All `/v1/owners`, `/v1/brokers`, and `/v1/properties` routes require the CRM `auth_session` cookie. Owner creation records `createdById` from the authenticated session. Request data cannot override or change that creator. The primary contact partner is a separate, editable active CRM user; omission defaults it to the creator and explicit `null` leaves it unassigned.

Owners require a name and Indian mobile number. Email, WhatsApp, address, and preference notes are optional. Status is ACTIVE or INACTIVE. The owner directory uses React Hook Form and Zod, with field errors mapped from API responses. A new owner can be created directly inside the property contact picker.

Published DIRECT listings require an owner; BROKER listings require a broker. A listing cannot link both. Switching the contact source automatically clears the previous link. Drafts may omit contact information until publication. Existing direct listings without an owner remain readable and can be linked through the editor before saving. Deleting a directory record preserves its properties and media, clearing the deleted contact's link.

Both directories expose `GET /:id/properties` with pagination, property summaries, cover thumbnails, and status. These lists exclude drafts and include archived listings. Counts come directly from property relationships. UI links use `propertyId`, `ownerId`, and `brokerId` URL parameters to open the exact profile or property details, including records outside the current directory page.

The maximum broker deal value has been removed from Prisma, API payloads/responses, sorting, frontend types, forms, and views. The legacy database column is retained so old values are not destructively discarded.

## Migrations

`20261009000000_baseline` captures the existing schema for new databases. Existing installations created with `db push` must baseline it rather than execute its CREATE statements. `20261009150000_owner_directory` adds the owner directory and nullable property owner relationship. Both migrations have been marked applied on the configured development database after the additive migration succeeded. Deploy other environments with the appropriate baseline and `prisma migrate deploy`.

## Verification

Run offline regression suites with `npm test` in `backend`. Run TypeScript checks in both projects. For live development API verification:

```sh
RUN_LIVE_API_TESTS=1 node tests/integration/directory-api.cjs
```

This opt-in suite loads `.dev.vars`, runs the actual Hono application, validators, authentication middleware, controllers, and Prisma database adapter, and creates isolated disposable users, sessions, owners, brokers, and listings. Cleanup executes in `finally`. It does not upload or modify existing media. Never point it at a production database.
