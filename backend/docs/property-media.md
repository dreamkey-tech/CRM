# Property media flow

A new listing uses one server draft ID. Selecting files creates/reuses that draft;
publishing updates the same row with `isDraft: false`. Normal listing requests
exclude drafts. Form fields and completed media references are cached locally;
opening a saved draft also refreshes its media from the backend.

The upload queue starts up to three files at a time. Each task requests a
five-minute presigned PUT URL when its queue slot opens, uploads directly to R2,
then attaches the file to the property. A file is complete only when attachment
succeeds. Attachment requests are serialized per property in the browser.

PUT retries get a fresh URL for the same object key. Attachment retries reuse the
uploaded object and return an existing matching media record when present.
Pending/failed files prevent publishing; users can retry or discard failed files.
Refreshing warns while uploads are active. File bytes/unfinished tasks are not
persisted across a browser reload; users must reselect unfinished files.

Cover selection and removal call the backend immediately. Reset removes a created
draft and its files before clearing the local form. Closing the form preserves
the draft and permits uploads to continue within the same browser tab.

## Storage configuration

Supply these backend environment values (use `.dev.vars` locally, your Worker
configuration/secrets in deployment). Never put R2 credentials in frontend env.

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_DOMAIN`: full HTTPS public media URL, without a trailing slash.
  `R2_PUBLIC_URL` is also supported for existing configurations;
  `R2_PUBLIC_DOMAIN` takes precedence when both are set.

The storage credentials must permit PUT, HEAD (attachment verification), and
DELETE on this bucket. The public domain must serve the uploaded object keys. The S3 API endpoint
(`*.r2.cloudflarestorage.com`) is not a public media domain and is rejected.
Wrangler local development reads `.dev.vars`; changing `.env` alone does not
switch the running Worker's bucket. Keep account, credentials, bucket, and public
URL aligned. Changing buckets does not move already-uploaded objects or update
existing database media URLs.
R2 upload CORS must allow your frontend origin, PUT requests, and Content-Type.
The backend derives public media URLs from its own configured domain and checks
object size/type before attaching. Database records are preserved if storage
deletion fails so users can retry.

The media categories and limits live in `src/config/property-media.json` and
`frontend/config/property-media.json`; keep those configurations aligned.
`maxCount: 0` means unlimited. The backend validates file size/type and checks
category counts when attaching, including uploads from other clients.

## Verification

Run `npm test` in `backend` for controller and upload queue regression tests.
Run `npm run typecheck` in `backend` and `npx tsc --noEmit` in `frontend`.
Tests use mocked DB/storage/HTTP boundaries; they do not contact a live bucket.

For a live smoke test, add a property with a photo, wait for attachment, publish,
reopen the listing, change its cover, remove a photo, and verify storage deletion.
Test a failed upload/retry and a draft reset as well. Verify refresh recovery for
completed media; browser reload cannot resume unfinished file uploads.

## Database transport

The backend uses the WebSocket-based `PrismaNeon` adapter, which supports the
transactions Prisma may start internally for writes and relation reads. Each
Worker request constructs its client and disconnects it in `finally`; no
WebSocket pool is reused across requests. `PrismaNeonHttp` rejects these
transactions and caused property publishing to return HTTP 500.
