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

- Configure `GOOGLE_SERVICE_ACCOUNT_JSON` and `GOOGLE_DRIVE_CONTRACTS_FOLDER_ID` in Vercel, share the approved Drive folder with the service-account email, then perform live DOCX upload verification.
- Visually render and inspect a generated DOCX. Local LibreOffice/soffice is unavailable.
- Consider enabling Supabase leaked-password protection and resolving the existing mutable search path warning in `donelvit.set_updated_at` as separate security work.

## Verification baseline

- `npm run typecheck` passes.
- Local `npm run build` is blocked only by the Windows sandbox `spawn EPERM`; Vercel production builds are the build authority.
- No automated test runner is installed. Production acceptance evidence is recorded per feature in `feature_list.json` and `progress.md`.
