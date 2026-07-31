# Session Progress Log

## Current State

**Current update (2026-07-30):** `mvp-005` Contracts is active. Client banking requisites maintenance added IBAN, Banca, and BIC to the Client form and new guarded RPC overloads to persist them; table schema and RLS were unchanged. `npm run typecheck` passed; production create acceptance confirmed all three saved values on the client detail page.

**Current update (2026-07-30):** `mvp-005` Contracts is complete; `mvp-006` Expert Review is now active. Contracts production acceptance created, edited, and archived contract ID 1, and its detail page verified the related-documents section.

**Current update (2026-07-30):** `mvp-006` Expert Review is complete; `mvp-007` DOCX templates is active. The production workflow created a linked review and recorded its resolution.

**Last Updated:** 2026-07-30
**Active Feature:** `mvp-004` — Documents
**Operational deployment:** production deployment and GitHub → Vercel automation verified on 2026-07-29.
**Status:** `mvp-001` — Projects, `mvp-002` — Clients, and `mvp-003` — Objects are complete. `mvp-004` — Documents is active.

## What's Done

- [x] Created and validated the agent harness (100/100 structural score).
- [x] Established a passing baseline: `./init.ps1 -SkipInstall` runs TypeScript checks and a production build successfully.
- [x] Corrected demo project fixtures missing `project_type_name`.
- [x] Recorded the user-approved MVP scope, implementation order, Supabase constraint, and GitHub-access status.
- [x] Recovered Vercel production: configured the public Supabase URL and anon key for Production and Preview, upgraded Next.js from 15.1.3 to 15.5.21, and deployed successfully.
- [x] Secured the public Projects experience: project-mutation RPC privileges were revoked and the production UI now presents a read-only registry and redirects write routes to safe read pages.
- [x] Implemented the approved minimal employee access model for Projects: email/password sign-in by administrator invitation only, no public signup or anonymous sign-ins, and authenticated-only project-mutation RPC access.
- [x] Corrected the stale read-only notice in the Projects registry; production now states that creation and editing are available to authenticated employees.
- [x] Initialized and connected the workspace Git repository to `DONELVIT/donelvit-os`; pushing `main` now triggers Vercel production deployments automatically.

## What's In Progress

- [ ] `mvp-002` — Clients
  - Implemented the existing-data read workflow: registry, contact/requisite details, relation counts, and linked Projects navigation.
  - Client create/edit/archive is pending explicit approval of its authenticated access model because the existing database has no client CRUD RPCs.

- [x] `mvp-001` — Projects
  - Inspect and complete the existing project workflow using the current Supabase model only.
  - Completed on 2026-07-29: authenticated production create → edit → archive acceptance passed for CP-0013-2026 (project ID 5); the final detail view displayed Archived.

- [x] Active feature selected.
  - Activate only `mvp-001` — Projects when implementation is requested.

## Latest Verification

- [x] 2026-07-31: `maint-001` Project system assignment accepted. Commit `ca27534` deployed as `dpl_FtgXqZWJovQMGdmugRQwMKZkgFzk` (READY). Authenticated production verification on project ID 1 selected CCTV, saved it, confirmed the overview count became 1, and confirmed `Supraveghere video` in `/projects/1?tab=systems`.

- [ ] 2026-07-30: Started `maint-001` Project system assignment after explicit user approval. Existing `system_types` and `project_systems` model is used without a new table. Project create/edit now loads active systems and passes `p_system_type_ids`; new guarded `create_project`/`update_project` overloads validate active IDs and atomically save links while direct browser INSERT/DELETE stays denied. `npm run typecheck` passed. `./init.ps1 -SkipInstall` and local `npm run build` stopped only at the known Windows sandbox `spawn EPERM`. The Supabase connector rejected the post-change verification query due to its usage limit; Vercel and manual production verification are pending.

- [ ] 2026-07-30: Drive integration configuration resumed. Added the sensitive production `GOOGLE_SERVICE_ACCOUNT_JSON` and production `GOOGLE_DRIVE_CONTRACTS_FOLDER_ID` in Vercel, then redeployed as `dpl_AUubdbPmhhCDvPceGpzEG8Kw5Pa6` (READY). The signed-in Google account can open the target folder but its sharing controls are disabled, so only the folder owner can grant the service account Editor access. A live generation attempt correctly reached the API but exposed a `{{...}}` delimiter mismatch in Contract.docx; source now configures these delimiters. `npm run typecheck` passed; local build stopped only at the known sandbox `spawn EPERM`. Re-deploy and re-test after the source fix.

- [ ] 2026-07-30: User explicitly deferred the remaining Google Drive configuration, real upload verification, and visual DOCX rendering. `mvp-007` is closed with those deferred items recorded; `mvp-008` Authentication and roles is now the sole active feature. No access rule has changed.

- [x] 2026-07-30: `mvp-008` read-only authorization audit completed. Supabase has one invited, confirmed employee and no application role in `app_metadata`; all registry tables are readable by both `anon` and `authenticated` through `prototype_read` policies. No authorization settings were changed. Security Advisor’s only findings remain mutable search path in `donelvit.set_updated_at` and disabled leaked-password protection.

- [ ] 2026-07-30: User approved `admin` / `engineer` / `viewer`. Added RLS-enabled `donelvit.user_roles`; new Auth users are automatically assigned `viewer`, and the existing confirmed employee is bootstrapped as `admin`. Editor-role triggers now guard writes to Clients, Contracts, Documents, Objects, Projects, and Expert Reviews. Guarded role RPCs supply the Settings access-management screen. SQL verification: anon cannot execute role check; authenticated can; admin writes succeed in a rolled-back transaction; engineer can edit but is not admin; viewer cannot edit. `npm run typecheck` passed. Security Advisor has no new findings. Production deployment/UI verification remains pending.

- [x] 2026-07-30: `mvp-008` accepted. Commit `d081b76` deployed to production as `dpl_BPXH523BYh3BCV95BWMtWWihGTdJ` (READY). Authenticated production Settings displayed Administrator role and the employee-role management table. `mvp-009` Final testing and launch is now the sole active feature.

- [x] 2026-07-30: `mvp-009` launch-readiness review completed. Vercel production runtime-error scan returned none in the prior hour. Rollout is GitHub `main` → Vercel and rollback is Vercel promotion of a prior ready deployment or Git revert. `docs/LAUNCH-HANDOFF.md` records verification evidence and all agreed deferred work.

- [ ] 2026-07-30: `mvp-007` DOCX templates is in progress. Added object selection on a contract detail screen, the DOCX template renderer, authenticated generation API, Drive service-account upload helper, and automatic document-register save through the existing `create_document(p_contract_id, ...)` RPC. The unchanged Contract.docx reference is stored at `assets/docx-templates/Contract.docx` (SHA-256 `1C00BCE1C3A89A4FB96D38CDCA1ED92A8B6A7D6FEA94D144912EB6D8AC08E127`); all 18 source tokens were mapped. `npm run typecheck` passed; `npm run build` again stopped only at Windows sandbox `spawn EPERM`. Commit `2ec9111` reached Vercel production as `dpl_637LxCL7zqg5y6xCuPsqsKG7kCcM` (READY, 27s, no build errors); a production browser check of `/contracts/1` confirmed the object picker and Generate DOCX control. Google Drive folder `1B4McqCVevbMxgJKAbY7UgtxxMmx4GAcF` was successfully inspected and is empty. The remaining blocker is service-account configuration in Vercel (`GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_DRIVE_CONTRACTS_FOLDER_ID`) and sharing the folder with its service-account email. Local visual DOCX rendering is additionally blocked because `soffice` is unavailable.

- [x] 2026-07-30: Expert Review production acceptance passed. Created review ID 1 linked to project E2E acceptance test 2026-07-29 — updated and document E2E Document acceptance 2026-07-30 — updated; updated it to `resolved` with the resolution text. RLS is enabled; anon has SELECT only, and direct INSERT is denied to anon and authenticated. Guarded RPCs deny anon EXECUTE, grant authenticated EXECUTE, and contain `auth.uid()` checks. `npm run typecheck` passed; local build stopped at known `spawn EPERM`.

- [x] 2026-07-30: Contracts production acceptance passed: contract ID 1 was created, edited (service `E2E acceptance updated`, revision `rev-2`), then archived. Registry showed `archived`; detail showed `1000 MDL` and the related-documents section. `npm run typecheck` passed; local `npm run build` stopped at the known Windows sandbox `spawn EPERM` after starting the optimized build.

- [x] 2026-07-30: Contract currency storage was approvedly widened from `char(1)` to `char(3)`; the production contract detail renders `1000 MDL`.

- [x] 2026-07-29: Production acceptance for `mvp-003` passed: created Object ID 5, updated its name, then archived it; final detail view showed Archived.

- [x] 2026-07-29: Production acceptance for `mvp-002` passed: created Client ID 5, updated its legal name, then archived it; final detail view showed an inactive client.

- [x] 2026-07-29: Clients data model verified in Supabase: `donelvit.clients` is RLS-enabled and has existing foreign-key relations to Projects, Objects, and Contracts. No existing client-specific CRUD function is present.
- [x] 2026-07-29: Clients access verified: both `anon` and `authenticated` have only `SELECT`; no write policy or CRUD RPC is present. No access rule was changed.
- [x] 2026-07-29: User approved the same authenticated employee model as Projects. Added guarded Client CRUD RPCs; all three deny anon EXECUTE, grant authenticated EXECUTE, and contain `auth.uid()` checks. Protected create/edit/archive UI routes are implemented; production acceptance remains pending.
- [x] 2026-07-29: Implemented Clients registry/detail read routes with Projects integration and a no-Supabase demo fallback. `npm run typecheck` passed; `npm run build` remains blocked by the known sandbox `spawn EPERM`.

- [x] 2026-07-29: Production acceptance for `mvp-001` passed as invited employee `vitalie.dones@gmail.com`: created CP-0013-2026, updated its title, then archived it. Final project detail view showed Archived.

- [x] 2026-07-29: Restored the documented demo-data fallback for Projects when public Supabase configuration is absent; registry/detail reads use demo fixtures and protected write screens receive safe empty options. Invalid non-positive/non-integer project IDs now return 404 instead of querying with `NaN`.
- [x] 2026-07-29: `npm run typecheck` passed after the change. `npm run build` again reached Next.js compilation then stopped at the known sandbox `spawn EPERM`; no application compilation error was reported.
- [ ] Production browser check found no employee session in the available browser, so no test mutation was made. The authenticated create → edit → archive acceptance check remains the gating manual verification.

## What's Next

1. Implement `mvp-002` — Clients using the existing data model, then verify its Projects integration.
2. Implement modules strictly in the order in `docs/MVP-ROADMAP.md`.
3. Add regression coverage during module work and finish final testing under `mvp-009`.

## Blockers / Risks

- [ ] Live Supabase connectivity and RLS configuration are intentionally unverified; do not infer them from local source files.
- [ ] The GitHub repository now contains the current source and is connected to Vercel. Keep future releases on `main` so the Git-triggered production workflow remains the source of truth.
- [ ] No automated test runner exists, so build/typecheck alone do not prove route behaviour.
- [ ] Local `next build` is blocked by this Windows sandbox with `spawn EPERM` after TypeScript succeeds; use the successful Vercel production build as build evidence until the local execution limitation is resolved.
- [x] The three authenticated project mutations were verified in production on 2026-07-29: CP-0013-2026 was created, updated, then archived under the invited employee account. Public signup and anonymous sign-ins remain disabled.
- [ ] Supabase security advisor warns that `donelvit.set_updated_at` has a mutable function search path. It is outside the project-mutation fix and requires a separately reviewed trigger-function change.
- [ ] Supabase CLI is unavailable locally and the workspace has no migration directory. The approved function changes were applied directly and documented here; create a tracked migration after GitHub/Supabase CLI access is available.

## Decisions Made

- **Baseline verification is `npm run typecheck` plus `npm run build`.** No test runner exists yet.
- **Use the existing Supabase structure without a schema redesign for MVP.** Database, RLS, storage, and auth changes remain approval-gated.
- **MVP order is fixed.** Projects → Clients → Objects → Documents → Contracts → Expert Review → DOCX templates → Authentication and roles → Final testing and launch.

## Verification Evidence

- [x] `./init.ps1 -SkipInstall` passed on 2026-07-29.
- [x] Harness validation scored 100/100 on 2026-07-29.
- [x] Vercel production deployment `dpl_453F72AqqMif5rCpJdSopMAWvSfM` reached `READY` on 2026-07-29; Vercel built all 9 routes and manual checks of `/` and `/projects` passed.
- [x] Supabase access-control verification on 2026-07-29: all `anon` and `authenticated` EXECUTE checks for `create_project`, `update_project`, and `archive_project` returned `false`; `anon` SELECT on `donelvit.projects` returned `true`.
- [x] Vercel production deployment `dpl_8oFeAT3tuRysb91G5TF7wnrjg6qo` reached `READY` on 2026-07-29. Browser verification confirmed the Projects read-only notice, `/projects/new` → `/projects`, and `/projects/1/edit` → `/projects/1`.
- [x] Vercel production deployment `dpl_E7Kem5SnmYHkJCA5JmmXkhZF2zdG` reached `READY` on 2026-07-29 with no build errors; `npm run typecheck` passed. Browser verification confirmed `/login` and the unauthenticated `/projects/new` → `/login?next=/projects/new` redirect. Supabase Auth settings verified: public signup false, anonymous sign-ins false, email confirmation true, Site URL `https://donelvit-os.vercel.app/auth/callback`; database checks confirmed anon false/authenticated true for all project RPC EXECUTE privileges and auth guards in every function.
- [x] Supabase Users confirmed that an invitation email was sent to the employee email supplied by the user on 2026-07-29.
- [x] Supabase Auth dashboard verification on 2026-07-29: the Email provider is Enabled after correcting the `email_provider_disabled` sign-in failure; public signup and anonymous sign-ins remain disabled and Confirm email remains enabled.
- [x] Supabase Auth logs on 2026-07-29: authenticated `/user` requests from `https://donelvit-os.vercel.app/` returned 200 after the Email provider correction.
- [x] Vercel production deployment `dpl_5Tauc4mjJM1QKrmECxYw4Lax9hrL` reached `READY` on 2026-07-29. Error-only build logs reported only completion; a production fetch of `/projects` confirmed the corrected employee write-access notice and New Project control.
- [x] Git commit `8900e39` was pushed to `DONELVIT/donelvit-os` `main` on 2026-07-29. Vercel detected that Git push and completed production deployment `dpl_F7qmh1dRmiaySppYszriviCec5kg` from source `git`; error-only logs show only build completion.

## 2026-07-30 Documents Progress

- [x] Added guarded `create_document`, `update_document`, and `archive_document` RPCs after user approval; storage policy was not changed.
- [x] Implemented Documents registry, creation, detail, and editing UI; commit `37a2ff1` is pushed to `main`.
- [x] `npm run typecheck` passed. `npm run build` reached Next.js compilation then failed only with the known Windows sandbox `spawn EPERM`.
- [x] Production manual verification: created document ID 1, opened its detail view, and changed the title to `E2E Document acceptance 2026-07-30 — updated`.
- [ ] Archive confirmation was opened, but the browser driver timed out before accepting it. Verify the record's `archived` status before closing `mvp-004`.
- [x] Manual production verification subsequently confirmed document ID 1 has final status `archived`; `mvp-004` is complete. The next active feature is `mvp-005` — Contracts.

## Notes for Next Session

Read `AGENTS.md`, this file, `docs/MVP-ROADMAP.md`, and `session-handoff.md`. Continue only `mvp-001` — Projects, then run `./init.ps1` before editing. Have the signed-in employee verify create, edit, and archive in the production UI; never create public signup or anonymous access.
