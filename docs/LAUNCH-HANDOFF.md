# DONELVIT OS — Launch Handoff

## Production

- URL: https://donelvit-os.vercel.app
- Delivery: GitHub `main` automatically deploys to Vercel production.
- Rollback: select a previous ready Vercel deployment and promote it, or revert the affected Git commit on `main`.

## Verified MVP workflows

- Projects, clients, objects, documents, and contracts: authenticated create, edit, and archive acceptance was completed in production.
- Expert Review: production create and resolve acceptance was completed.
- Authentication: invitation-only email/password access; public signup and anonymous sign-in are disabled.
- Roles: admin, engineer, viewer. New invited users start as viewer; administrators change roles in Settings.
- Production build: Vercel deployment `dpl_BPXH523BYh3BCV95BWMtWWihGTdJ` is READY. Runtime error scan on 2026-07-30 found no errors in the prior hour.

## Deferred operational work

- Production uses server-only Google OAuth settings plus `GOOGLE_DRIVE_CONTRACTS_FOLDER_ID`; do not expose their values. On 2026-08-06, authenticated production generation uploaded `Договор E2E-CONTRACT-20260730.docx` to the approved Drive folder and automatically linked it to contract ID 1 as document ID 5.
- The generated DOCX was visually inspected in Google Docs on 2026-08-06; title, party requisites, headings and object substitution are readable with no visible layout breakage or unresolved markers.
- 2026-08-06 Security Advisor audit: the `donelvit.set_updated_at` mutable-search-path warning was resolved with approved migration `fix_set_updated_at_search_path`. Leaked-password protection remains unavailable on the project's Free plan; Supabase exposes it in the Email provider settings only on Pro plan and above. No billing or Auth setting was changed.
- Consider enabling Supabase leaked-password protection and resolving the existing mutable search path warning in `donelvit.set_updated_at` as separate security work.

## Verification baseline

- `npm run typecheck` passes.
- Local `npm run build` is blocked only by the Windows sandbox `spawn EPERM`; Vercel production builds are the build authority.
- No automated test runner is installed. Production acceptance evidence is recorded per feature in `feature_list.json` and `progress.md`.
