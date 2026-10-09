# Clients V1 schema

This step adds Prisma models, an additive migration, frontend types, Zod input
schemas, and matching client document configuration. It does not add routes,
controllers, pages, uploads, message sending, or a public sharing endpoint yet.
The existing broker/owner design in `frontend/design.md` applies to the next UI step.

## Records

- `Client`: name, required mobile number, optional email/WhatsApp/address/notes,
  Active/Inactive, authenticated creator, timestamps. Phone is indexed, not unique:
  shared household numbers are possible. Duplicate detection belongs in the UI/API.
- `ClientPartnerAssignment`: multiple assigned CRM users with who assigned them and
  when. `(clientId, partnerId)` prevents duplicates. `All Clients` lists the directory;
  `My Clients` filters assignments by `auth.user.id`, not creator. Unassigned clients
  are allowed. Future controllers must verify assigned users exist and are active.
- `ClientShortlistedProperty`: one connection per client/property, notes, authenticated
  adding partner, timestamps, Shortlisted/Shared/Visited/Interested/Not Interested.
  These are property feedback statuses, not a lead pipeline.
- `ClientPropertyShare`: channel, message, optional email subject, resolved recipient,
  public token, whitelisted listing snapshot, authenticated creator, expiry/revocation,
  selected-media metadata snapshot, and Prepared/Composer Opened/Sent Confirmed.
  Multiple shares of the same property
  can be recorded. Its composite FK ensures the shortlist belongs to that client and
  property. Generate a URL from the token and the frontend's configured public origin.
- `ClientPropertyShareMedia`: selected existing property media in display order.
  Composite FKs prohibit media from a different property. No client document relation
  exists here. Removing property media removes its share associations; it must also
  disappear from the public page. The selection metadata remains in the share's
  historical snapshot, without permanent media URLs.
- `ClientDocument`: category, title, original name, unique private R2 key, MIME type,
  size, authenticated uploader, timestamps. No permanent public URL is stored.

Creator, assignment actor, shortlist actor, uploader, tokens, snapshot, recipients,
and event timestamps are server-controlled. Strict request schemas reject these
fields supplied by a caller. Partial client updates apply no creation defaults.

## Documents

Categories: Aadhaar, Payment Receipt, Client Document, PCC Application, Certificate,
and KYC. Each permits PDF, JPEG, PNG, or WebP up to 10 MiB per file. `maxCount: 0`
means unlimited documents in a category, matching the property config convention;
upload batches are limited to 30. Limits can be changed in both `client-media.json`
files. `media-config.ts` exports separate client rules without changing property rules.

Client documents require a **separate private R2 bucket**, without public development
URL/custom-domain access. A `clients/` key prefix inside the public property bucket
does not make a document private. The next upload step must use private storage
helpers and authorized short-lived GET URLs instead of the public property helpers.
Do not store Aadhaar numbers in this simple client record.

After upload, verify the server-issued key belongs to the client and check actual
object size/type against its metadata before saving. The metadata schemas alone do
not verify stored bytes. Future uploads must authorize the client, verify file content,
and never trust MIME metadata alone. Private previews/downloads require authentication
and the relevant permission; client documents never appear on public property pages.

## Sharing behavior for the next step

Validate that the selected listing is published and accessible. Create/find its
shortlist connection, construct `publicPropertySnapshotSchema` explicitly, resolve
the destination from the client, and generate a cryptographically random public token
(at least 32 random bytes, URL-safe). Property facts and selected public property media
may be shared; CRM notes, recipient information, client documents, and private owner/
broker contact details may not. The public handler checks revocation/expiry and listing
availability before returning a public response; it must never return the private share
record or private client data. Resolve only media still belonging to the linked property.

Opening WhatsApp/mail does not prove sending. Only update `COMPOSER_OPENED` when the
composer launches and `SENT_CONFIRMED` when a partner explicitly confirms. Server
controllers must enforce forward status changes and record their own timestamps.
`sentConfirmedAt` means a partner confirmation, not provider delivery. Moving the
shortlist to `SHARED` must not downgrade `VISITED` or either feedback status.

History protects related rows from hard deletion. Use Active/Inactive for clients and
archive existing properties; remove stored document bytes successfully before deleting
document rows. A client with shares/documents cannot be cascade-deleted accidentally.

## Migration and checks

The client migration is additive and generated against the owner schema already in
this workspace. It preserves existing tables/columns, including the legacy broker
maximum budget column. The migration is prepared but not applied in this schema step.
Apply it with the project's migration deployment workflow before implementing the API.

Checks: Prisma validate/generate, backend/frontend TypeScript, targeted frontend lint,
and the backend suite including frontend/backend validation agreement, document limits,
  private field rejection, and migration constraint checks. No live API tests are possible
for clients yet because this step intentionally has no client endpoints.
