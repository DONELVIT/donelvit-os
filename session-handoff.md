# Session Handoff

## Current Objective

- Update 2026-07-31: `maint-001` Project system assignment is complete. Commit `ca27534` deployed as `dpl_FtgXqZWJovQMGdmugRQwMKZkgFzk` (READY). In an authenticated production check, CCTV was selected for project ID 1, saved, and rendered as Supraveghere video under `/projects/1?tab=systems`; the system counter showed 1. No active feature remains.

- Update 2026-07-30: `maint-001` Project system assignment is active. User authorized protected Supabase RPC changes. UI code adds active-system checkboxes and sends `p_system_type_ids`; overloaded `create_project`/`update_project` validate active types and sync existing `project_systems` links with no direct browser grants. Typecheck passed. Local build remains blocked by sandbox `spawn EPERM`; the Supabase connector hit its usage limit before post-change privilege checks. Push, wait for Vercel, then verify create/edit plus `/projects/[id]?tab=systems` in production.

- Update 2026-07-30: Google Drive production variables are configured in Vercel and a settings redeploy `dpl_AUubdbPmhhCDvPceGpzEG8Kw5Pa6` is READY. First live generation found a Contract.docx delimiter mismatch; `lib/contracts/contract-docx.ts` now uses `{{` / `}}` delimiters and needs a pushed production re-test. The signed-in Google account cannot manage access to the approved Drive folder; its owner must share the folder with the service account as Editor before the upload can complete.

- Update 2026-07-31: Diagnostic deployment `dpl_2ZGooggdPu82fPAgzxrnBSRcdPGp` (commit `07ce429`) is READY. Authenticated production generation for contract ID 1 successfully passed template rendering but failed at the Google Drive upload with HTTP 403; no Documents record was created. Do not change scopes or credentials. Next step is for the folder owner to confirm that the exact folder `1B4McqCVevbMxgJKAbY7UgtxxMmx4GAcF` is shared with `vercel-drive@contracte-proiectare.iam.gserviceaccount.com` as Editor, then repeat one live generation and verify the Drive file plus linked document. Visual DOCX QA remains pending.

- Update 2026-07-31: The user confirmed the service account is an Editor of the exact My Drive folder and explicitly approved OAuth instead. `mvp-007` is re-opened as the sole active feature. The server-side uploader now requires `GOOGLE_DRIVE_OAUTH_CLIENT_ID`, `GOOGLE_DRIVE_OAUTH_CLIENT_SECRET`, and `GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN`; setup is in `docs/GOOGLE-DRIVE-OAUTH.md`. Do not store these values in source or the browser. After the user adds all three sensitive Production values in Vercel, wait for a READY deployment, generate one contract, verify the Drive file and linked document, then complete visual DOCX QA.

- Update 2026-07-31: Redeployed OAuth settings as `dpl_6ckJHaJX2zaHbTHZBH6e7fGFqNjN` (READY) and ran one authenticated production generation for contract ID 1. Template rendering and endpoint configuration passed, but the Google token endpoint returned `internal_failure`; no upload or Documents record occurred. Most likely the refresh token was generated under different OAuth credentials or the wrong Step 2 token was stored. User must regenerate the refresh token in OAuth Playground with **Use your own OAuth credentials** enabled and the same client ID/secret that Vercel stores. Re-test exactly once after replacement.

- Update 2026-08-06: The user replaced the production refresh token and deployed Vercel. One authenticated production generation for contract ID 1, selecting `Fabrica Articole din Tutun`, succeeded. The Google Drive folder contains `Договор E2E-CONTRACT-20260730.docx` (26,397 bytes), and `/contracts/1` lists it as linked document ID 5. OAuth upload and automatic document registration are complete. `mvp-007` remains active only for visual DOCX rendering/inspection; do not alter its data or OAuth configuration.

- Update 2026-08-06: The generated DOCX was opened and visually inspected in Google Docs. The title, party requisites, section headings and object substitution are readable, with no visible unresolved markers or layout breakage. `mvp-007` is complete and no feature is active.

- Update 2026-08-06: `security-001` is the active feature. Read-only Supabase Security Advisor audit found two warnings: a role-mutable search_path in `donelvit.set_updated_at`, and leaked-password protection disabled. The trigger body only sets NEW.updated_at; prepare the documented replacement with fixed `search_path = donelvit, pg_temp` after explicit user approval. Enabling leaked-password protection is an Auth-dashboard configuration change and requires Pro plan or above. Do not apply either change without confirmation.

- Update 2026-08-06: Applied approved migration `fix_set_updated_at_search_path`; function verification shows `SET search_path TO 'donelvit', 'pg_temp'`, and Security Advisor no longer reports that warning. `security-001` is blocked only by the remaining leaked-password setting: the project is on Supabase Free and the Email provider UI states that the setting is available on Pro plan and above. No billing or Auth setting was changed. After an upgrade, enable that one switch, save, rescan Security Advisor and mark the feature complete.

- Update 2026-08-06: Added planned `mvp-010` Engineering standards library for NCM, HG, EN and ISO after the project-management core. Do not begin it while `security-001` is active. Before implementation, obtain the authoritative sources, licensing/access rules, catalog metadata and expected search behaviour.

- Update 2026-08-06: User deferred the paid upgrade. `security-001` remains blocked only by the Pro-plan leaked-password setting. `mvp-010` is now active: audit the existing Normatives route and then request authoritative NCM/HG/EN/ISO sources, licensing/access terms, required metadata and search expectations before any catalog import or schema change.

- Update 2026-08-06: `mvp-010` audit is complete. `/normatives` is a static placeholder, with no catalog route/data model/API; the existing Expert Review `normative_reference` is free text only. Next implementation requires the inputs in `docs/NORMATIVES-REQUIREMENTS.md`. Use metadata plus authorised links by default; do not upload/index/distribute NCM/HG/EN/ISO PDFs without explicit rights and a separately approved schema/RLS design.

- Update 2026-08-06: User supplied `https://ednc.gov.md/`; source audit confirms it is the MIDR Moldova construction-normative portal. Use it as the official discovery/metadata source for NCM/CP: EDNC has public catalog/search, rich document metadata and source links, but no verified documented API/CSV. For MVP, index metadata and link back to EDNC only. Its terms distinguish free documents from copyright-restricted/purchase content; do not mirror PDFs or full-text index NCM/EN/ISO without written rights.

- Update 2026-08-06: Implemented approved `mvp-010` metadata catalog. Applied Supabase migration `add_normatives_catalog`: RLS enabled, SELECT only for anon/authenticated, no direct browser writes, and three EDNC NCM metadata rows seeded. Added `lib/data/normatives.ts`, `/normatives` registry with code/title search and family filter, and `/normatives/[id]` detail with outbound EDNC source link. PDFs are never stored or indexed. Run deployment and manual production verification next, then record Security Advisor results and close the feature only if both pass.

- Update 2026-08-06: User approved a local normative-file upload. Created Google Drive folder `DONELVIT OS — Normatives` at `https://drive.google.com/drive/folders/1OjhoIb0IGQuWUBBUDptWYCI_hOAU0Dm2` and uploaded 27 unique recognised NCM/CP/EN/ISO PDF/DOCX files after SHA-256 duplicate filtering. Excluded installers, templates, spreadsheets, presentations, generic materials and duplicates. Folder is private/not shared. Current catalog still exposes official EDNC metadata links; do not change those to local copies without a distinct user instruction to link Drive URLs into catalog metadata.

- Update 2026-08-06: Production check of `mvp-010` passed on deployment `dpl_917KGSAegrDybJB7VrLUgUj2Xtiv` (READY). The authenticated `/normatives` page displayed all three seeded EDNC metadata records; searching `E.03.05` returned only `NCM E.03.05:2026`. `npm run typecheck` passed. The feature remains active because the newly uploaded, private Drive files have not been associated with catalog entries; such an association requires an explicitly approved metadata/schema decision.

- Update 2026-08-06: `mvp-010` is complete. User approved linking private Drive copies, so no schema/RLS/grant change was needed: exact references are stored in existing `normatives.metadata.drive_files`, while EDNC `source_url` remains the official source. Production deployment `dpl_2Cu8aULjU5TFYaPpA2p1w8mBwvwa` is READY. Browser verification confirms the internal Google Drive link appears once on NCM E.03.05:2026 and NCM C.01.08-2025, and is absent for unmatched NCM G.01.02-2025. The UI warns that Drive access depends on its own permissions. `npm run typecheck` passed; `./init.ps1` again stopped only at the known local Next.js `spawn EPERM` build limitation. No active feature remains.

- Update 2026-07-30: Client banking requisites maintenance is deployed and production-verified. `components/client-form.tsx` collects IBAN, Banca, BIC; new authenticated-only `create_client`/`update_client` RPC overloads persist those fields without a table or RLS change. `npm run typecheck` passed; E2E Banking Client 20260730 was created in production and its detail page displayed all three saved values. Contract currency now stores three characters and production detail shows `1000 MDL`; final Contract edit/archive and document-reference verification remain pending.

- Update 2026-07-30: `mvp-005` Contracts is complete. Production contract ID 1 was created, edited, and archived; the detail page displays `1000 MDL` and the linked-documents section. `mvp-006` Expert Review is the active feature; inspect its existing schema and routes before proposing any mutation model.

- Update 2026-07-30: `mvp-006` Expert Review is complete. Added the approved RLS-enabled `donelvit.expert_reviews` table and guarded create/update RPCs; production review ID 1 was created with project/document links then moved to `resolved` with a resolution. `mvp-007` DOCX templates is active; request explicit required template files and source-field mapping before implementation.

- Update 2026-07-30: `mvp-004` Documents is complete. Production registry confirmed document ID 1 has final status `archived`. `mvp-005` Contracts is now active; its mutation model requires explicit user approval before implementation.

- Goal: deliver DONELVIT OS MVP in the approved module order.
- Current status: `mvp-001` — Projects, `mvp-002` — Clients, and `mvp-003` — Objects are complete. `mvp-004` — Documents is active.
- Branch / commit: local `main` is connected to `origin` (`DONELVIT/donelvit-os`); pushes to `main` trigger Vercel production deployments.

## Completed This Session

- [x] Created and verified the agent harness.
- [x] Recorded the approved MVP sequence and the rule to use existing Supabase tables/functions without schema redesign.
- [x] Recorded GitHub access as unavailable external context.
- [x] Recovered Vercel production: configured the public Supabase URL and anon key for Production and Preview; upgraded `next` from 15.1.3 to 15.5.21; production deployment `dpl_453F72AqqMif5rCpJdSopMAWvSfM` is `READY`.
- [x] On explicit user approval, revoked `EXECUTE` from `PUBLIC`, `anon`, and `authenticated` for the SECURITY DEFINER project-mutation RPCs: `create_project`, `update_project`, and `archive_project`.
- [x] Deployed the secure read-only Projects UI to production: `dpl_8oFeAT3tuRysb91G5TF7wnrjg6qo` is `READY`. The registry states its read-only mode; create and edit routes redirect to safe read pages.
- [x] Implemented the user-approved employee access model: public signup and anonymous sign-ins are disabled; email/password login is invitation-only; Auth Site URL is `https://donelvit-os.vercel.app/auth/callback`; authenticated project routes, invitation callback, and password setup are deployed in `dpl_E7Kem5SnmYHkJCA5JmmXkhZF2zdG`.
- [x] Updated every project mutation RPC to require `auth.uid()`; revoked anon/public EXECUTE and granted EXECUTE only to `authenticated`.
- [x] Sent a Supabase invitation to the employee email supplied by the user on 2026-07-29; the dashboard confirmed delivery.
- [x] Corrected an `email_provider_disabled` login failure by re-enabling the Supabase Email provider. The persisted dashboard state is Email Enabled; public signup and anonymous sign-ins remain disabled.
- [x] Verified successful employee sign-in after that correction: Supabase Auth logs show authenticated `/user` requests from the production site returning 200.
- [x] Deployed and verified the corrected Projects registry access notice: deployment `dpl_5Tauc4mjJM1QKrmECxYw4Lax9hrL` is `READY`; `/projects` states that creation and editing are available to authenticated employees.
- [x] Restored GitHub deployment workflow: commit `8900e39` was pushed to `main`, automatically triggering Git deployment `dpl_F7qmh1dRmiaySppYszriviCec5kg`, which is `READY` with no build errors.

## Verification Evidence

| Check | Command | Result | Notes |
|---|---|---|---|
| TypeScript and production build | `./init.ps1 -SkipInstall` | Passed | 2026-07-29; all 9 pages generated. |
| Harness structure | `node C:/Users/dones/.codex/skills/harness-creator/scripts/validate-harness.mjs --target .` | Passed | 100/100 on 2026-07-29. |
| Vercel production | Deployment `dpl_453F72AqqMif5rCpJdSopMAWvSfM` | Passed | `READY` on 2026-07-29; Vercel built all 9 routes; `/` and `/projects` opened successfully. |
| Supabase project-mutation privileges | `has_function_privilege` / `has_table_privilege` checks | Passed | 2026-07-29: six anon/authenticated EXECUTE checks are `false`; anon can still SELECT `donelvit.projects`. |
| Secure Projects production UI | Deployment `dpl_8oFeAT3tuRysb91G5TF7wnrjg6qo` and browser checks | Passed | `READY` on 2026-07-29; read-only notice is visible, `/projects/new` redirects to `/projects`, and `/projects/1/edit` redirects to `/projects/1`. |
| Authenticated Projects production UI | Deployment `dpl_E7Kem5SnmYHkJCA5JmmXkhZF2zdG`, browser checks, `npm run typecheck` | Passed | `READY` on 2026-07-29; no Vercel build errors; `/login` renders and anonymous `/projects/new` redirects to login. |
| Supabase authenticated mutation access | Auth settings, `has_function_privilege`, function-definition checks | Passed | Signup and anonymous sign-in false; anon EXECUTE false and authenticated EXECUTE true for all three RPCs; every function contains an `auth.uid()` guard. |
| Employee invitation | Supabase Authentication > Users | Passed | Invitation sent to the email supplied by the user on 2026-07-29; dashboard displayed a delivery confirmation. |
| Email/password sign-in availability | Supabase Authentication > Sign In / Providers | Passed | On 2026-07-29, re-enabled the Email provider after an `email_provider_disabled` login error; the dashboard now displays Email Enabled while signup and anonymous access remain disabled. |
| Employee sign-in | Supabase Auth logs | Passed | After the provider correction, authenticated `/user` requests from the production site returned 200. |
| Corrected Projects registry notice | Deployment `dpl_5Tauc4mjJM1QKrmECxYw4Lax9hrL`, Vercel fetch | Passed | `READY` on 2026-07-29; no build errors and production `/projects` presents the employee write-access notice. |
| GitHub → Vercel production workflow | Commit `8900e39`, deployment `dpl_F7qmh1dRmiaySppYszriviCec5kg` | Passed | Commit was pushed to `main`; Vercel reports source `git`, Git metadata for that commit, `READY`, and no build errors. |

## Latest Verification

- 2026-07-29: Authenticated production acceptance passed for Objects. Test object ID 5 was created, edited, and archived; its final detail view displayed Archived.

- 2026-07-29: Authenticated production acceptance passed for Clients. Test client ID 5 was created, edited, and archived; its final detail view displayed an inactive client.

- 2026-07-29: Began `mvp-002` — Clients. Verified that the existing RLS-enabled `donelvit.clients` table has relations to Projects, Objects, and Contracts, but no client CRUD RPC exists. Implemented read-only registry/detail views and linked-project navigation without a schema or access-rule change. Typecheck passed; local build remains blocked by sandbox `spawn EPERM`.
- 2026-07-29: Verified Clients grants: `anon` and `authenticated` have SELECT only, and no write policy is present. Client mutation requires explicit access-model approval.
- 2026-07-29: User approved Client mutation model. Added `create_client`, `update_client`, and `archive_client` RPCs with `auth.uid()` guards; verified anon EXECUTE false and authenticated EXECUTE true. Implemented protected Client create/edit/archive routes. Production acceptance remains pending.

- 2026-07-29: Authenticated production acceptance passed for Projects under `vitalie.dones@gmail.com`. Test project CP-0013-2026 (ID 5) was created, edited, and archived; its final detail view displayed Archived.

- 2026-07-29: Restored the documented no-Supabase demo fallback in `lib/data/projects.ts`; project registry/detail reads use demo fixtures, while write-option reads return safe empty values. Added validation for invalid project route IDs.
- `npm run typecheck` passed after these changes. `npm run build` remains blocked by the known Windows sandbox `spawn EPERM` during Next.js compilation; no application compilation error was reported.
- A production browser read confirmed the project registry loads, but the available browser has no signed-in employee session. No data mutation was attempted; authenticated create → edit → archive remains mandatory acceptance evidence.

## Files Changed

- `app/login/page.tsx`, `app/auth/callback/page.tsx`, `app/set-password/page.tsx`, and `components/auth-ui.tsx` — invitation-only employee sign-in, callback, password setup, and session UI.
- `app/projects/page.tsx`, `app/projects/new/page.tsx`, `app/projects/[id]/edit/page.tsx`, and `components/app-shell.tsx` — authenticated write links/routes, current user status, and a production-accurate access notice.
- `feature_list.json`, `progress.md`, and this file — MVP state, access-control evidence, and restart path.

## Decisions Made

- MVP order: Projects, Clients, Objects, Documents, Contracts, Expert Review, DOCX templates, Authentication and roles, final testing and launch.
- Supabase/RLS/database changes require explicit approval; no schema redesign is part of MVP. The user approved the project-function privilege remediation and the model "all invited, authenticated employees may write; no public signup" on 2026-07-29.

## Blockers / Risks

- Live Supabase configuration and detailed route behaviour are unverified.
- No automated test suite exists yet.
- Git is initialized in this workspace, `origin` is `DONELVIT/donelvit-os`, and `main` is configured to trigger the Vercel production deployment. Avoid direct source uploads unless Git integration is unavailable.
- `mvp-001` is active. Production read paths work. The three project RPCs require `auth.uid()`, deny anon/public EXECUTE, and grant EXECUTE only to authenticated users. Public signup and anonymous sign-ins are disabled; do not re-enable either.
- Projects acceptance is complete: an invited employee account created, edited, and archived test project CP-0013-2026 in the production UI on 2026-07-29. Do not create another account or send a duplicate invitation unless the user requests it.
- Supabase Security Advisor still reports a mutable search path in the unrelated `donelvit.set_updated_at` trigger function; its remediation needs separate review.
- Supabase CLI is not installed and no local migration folder exists, so the approved production function changes have no tracked local migration yet.

## Next Session Startup

1. Read `AGENTS.md`, `feature_list.json`, `progress.md`, and `docs/MVP-ROADMAP.md`.
2. Continue exactly one active feature: `mvp-002` — Clients.
3. Run `./init.ps1` on Windows or `./init.sh` in a POSIX shell before editing.

## 2026-07-30 Documents Handoff

- Documents registry, create, detail, and edit routes are implemented and pushed in `37a2ff1`.
- Production acceptance created document ID 1 and updated its title successfully. The archive button opened its confirmation, but browser control timed out before confirmation; it still shows `draft`.
- `npm run typecheck` passed. `npm run build` failed only at the known Windows sandbox `spawn EPERM`.
- Next step: archive document ID 1 from `https://donelvit-os.vercel.app/documents/1/edit`, verify its detail status, then mark `mvp-004` complete and begin `mvp-005` only after approval for contract mutations.

## Recommended Next Step

- Obtain explicit approval for the client mutation access model before adding protected create/edit/archive capabilities; no existing client CRUD RPC is available.

## 2026-08-06 Verification Module Handoff

- Active feature is `verification-001`: internal verification of project fire-safety compliance and project-documentation completeness for all object categories, against Republic of Moldova requirements.
- Scope approved by the user: all object types. The first delivery must keep the result explicitly internal and must not claim an official expert opinion or substitute for approval by the competent authority.
- Authoritative starting sources: Law No. 267/1994 on fire protection, Government Decision No. 847/2022 (general fire-protection rules), and CP E.03.02:2018 (project fire-safety section and audit methodology). Check current versions on Legis/EDNC before expanding any checklist.
- No Supabase schema, RLS, role, or migration approval has been granted for this feature. Build the first workspace as a read-only, versioned catalogue/UI; request approval before persisting check results, attachments, or assignments.
- 2026-08-06 baseline: `npm run typecheck` passed via `./init.ps1`; `next build` stopped at known local Windows sandbox `spawn EPERM` while creating the optimized build, before an application compilation error.
- Implemented `app/verification/page.tsx` and `lib/verification/catalog.ts`; sidebar now links to `/verification`. Five selectable profiles are read-only and cover the full agreed category set. Every profile contains separate fire-safety and documentation-completeness checklists; the screen links Law No. 267/1994, HG No. 847/2022 and CP E.03.02:2018. It carries an internal-verification disclaimer.
- Verification after implementation: `npm run typecheck` and `git diff --check` passed on 2026-08-06. Production commit `c658503` deployed as `dpl_Dp8i8Fmxur5DhPFY3oycxaZCMXRy` (READY); fetching `/verification` returned HTTP 200 and confirmed the module navigation, five profiles and checklist content. `verification-001` is complete. Persistence of results, assignments and evidence remains a separate future feature requiring explicit Supabase model/RLS approval.

## 2026-08-06 AI Verification Analysis Handoff

- Active feature is `verification-002`. The user approved sending project PDF/DOCX files for transient OpenAI API analysis and requested recommendations for eliminating discrepancies. Do not persist the uploaded file or result in Supabase without separate approval.
- The processing endpoint must require the existing authenticated employee session, use only server-side `OPENAI_API_KEY`, limit request size, return a structured internal report, and make clear that it is not an official expertise conclusion.
- OpenAI Docs MCP setup was attempted as instructed but `codex.exe` was denied by the local environment even after escalation. Fallback verification used official OpenAI developer documentation: Responses `input_file` supports base64 PDF/DOCX; PDFs include extracted text and page images on vision-capable models, while DOCX provides extracted text.
- Implemented `components/verification-analyzer.tsx` and `app/api/verification/analyze/route.ts`. The UI accepts authenticated employee uploads only, limits PDF/DOCX files to 4 MB, and displays structured internal findings/recommendations in the browser. The endpoint keeps neither source file nor report, sends the file directly as a base64 `input_file` to the OpenAI Responses API, and uses `gpt-5.6-terra` with strict JSON schema output. `.env.example` now documents server-only `OPENAI_API_KEY`.
- `npm run typecheck` and `git diff --check` passed on 2026-08-06. Production deployment `dpl_CHD4DrBHjVH7d9P7vAzkgfjJweF5` for commit `d686266` is READY; `/verification` returned HTTP 200 and rendered the file-upload control. The end-to-end flow cannot be executed until a valid `OPENAI_API_KEY` is added to the Vercel Production environment; do not add a key to source control or expose it as `NEXT_PUBLIC_*`.

## 2026-08-06 Private Blob Upload Handoff

- User approved replacing the 4 MB upload cap. Create a private Vercel Blob store named `donelvit-verification` in Frankfurt (FRA1) and connect it to `donelvit-os` with the automatically provisioned server-only `BLOB_READ_WRITE_TOKEN` in Production and Preview. The store is private; its dashboard tab is kept open for handoff.
- Commit `ef94814` adds `@vercel/blob`, `app/api/verification/upload/route.ts`, and updates the analyzer to upload PDF/DOCX directly to a private user-scoped Blob path. The token route validates the existing Supabase access token before issuing the Blob upload token. Analysis issues an OpenAI-only 10-minute private presigned GET URL, then deletes the Blob in `finally`, including failure cases. The client limit is 50 MB, not 100 MB, because the official OpenAI file-input limit is 50 MB per request.
- `npm run typecheck` and `git diff --check` passed. Local `npm run build` again failed before app compilation with known Windows sandbox `spawn EPERM`. Vercel production deployment `dpl_7PVZYZMEKcv8rEntvtXEJaF5XHNi` is READY and `/verification` fetch returned 200, rendering the private-temporary-storage notice. Remaining acceptance is one authenticated PDF/DOCX upload using the configured key, followed by a dashboard check that the Blob was automatically deleted.
- The user also requested a full engineering AI agent. `engineering-agent-001` is planned after `verification-002`: NCM/CP/HG/EN checks, version comparison, cause-effect matrices, INIM/address lines, power/acoustic calculations, DOCX draft opinion and proposed corrections. Before implementation, agree individual input file formats, authoritative normative sources and editions, calculation methodology, output liability wording and any data-retention/approval model.

## 2026-08-06 OpenAI File-URL Fix

- User tested the new flow and received `Mutually exclusive parameters: 'input[0].content[0]'. Ensure you are only providing one of: 'file_id' or 'filename'.` The request sent `filename` alongside a private `file_url`. Official OpenAI Responses file-URL examples use only `{ type: "input_file", file_url }`; `filename` is only used with base64 `file_data`.
- Commit `b5f660a` removes `filename` from the `file_url` content item. Typecheck and diff check passed; production deployment `dpl_76vNvLesAHcekjNmgR18heVKP8eo` is READY. Ask the user to repeat the same authenticated analysis. The failed request ran the `finally` block, so its temporary Blob was deleted.

## 2026-08-06 Mandatory Verification Norms

- User requires every project verification to use: NCM G.02.01:2017 (electronic communication, automation and signalling systems), NCM C.01.08:2025 (apartment buildings) and NCM E.03.03-2018 (fire signalling and warning installations). Official EDNC audit confirms each record is in force; NCM C.01.08:2025 took effect 19 December 2025 and replaces the 2016 edition.
- Commit `821aece` adds official EDNC source links to the Verification workspace and injects the three records into the AI instruction as a priority mandatory normative basis. The instruction avoids a false nonconformity by requiring NCM C.01.08:2025 to be marked not applicable for non-apartment-building object types. Typecheck/diff check passed and Vercel production deployment `dpl_BL1ftd5jyt7BNPYxBh4TGw76d3ZW` is READY.

## 2026-08-06 Local Verification Fallback

- The user requested a non-paid local option after the OpenAI account reported no remaining API credits. `components/local-verification-analyzer.tsx` is a client component rendered before the optional AI panel on `/verification`.
- It handles PDF, DOCX, DOC and DWG files up to 25 MB entirely in the browser: PDF.js extracts PDF text, DOCX XML is read with PizZip, and DOC/DWG receive best-effort extraction of textual labels from binary content. No request is made to the server, Vercel Blob, OpenAI, Supabase or any other storage.
- Rules give a baseline search-based internal report with recommendations for NCM G.02.01:2017, NCM E.03.03-2018 and NCM C.01.08:2025 for the residential profile. It must not be represented as an engineering calculation or official expertise: scanned PDFs, DWG geometry/raster sheets, DOC binary formatting and calculations require manual review or a future approved OCR/CAD engine.
- `npm run typecheck` and `git diff --check` passed. The pre-existing local Next.js build blocker remains Windows sandbox `spawn EPERM`; run Vercel production deployment and a manual client-file check next.

## 2026-08-06 Removal of Interactive Verification Modules

- The user requested removal of the verification modules. Deleted `components/local-verification-analyzer.tsx`, `components/verification-analyzer.tsx`, `/api/verification/analyze`, and `/api/verification/upload`; removed their imports from `/verification`.
- Removed unused `@vercel/blob` and `pdfjs-dist` packages. The page remains as a read-only verification reference with object profiles and normative links; no source document can now be uploaded or analysed.
- `npx next typegen`, `npm run typecheck`, `npm run build` and `git diff --check` pass. There is no active feature. Publish and manually fetch `/verification` next.

## 2026-08-06 Production Data Reset

- On explicit user instruction, performed one transaction with `TRUNCATE ... RESTART IDENTITY` on only the agreed working data tables: `clients`, `objects`, `projects`, `documents`, `contracts`, `expert_reviews`, plus dependent `project_systems`, `contract_objects`, `acts`, and `payments`.
- Pre-reset counts were 7 clients, 6 objects, 6 projects, 2 documents, 2 contracts, 1 expert review and 2 project-system links. Post-reset verification confirms all ten target tables contain 0 rows.
- Auth users, `user_roles` (1 row), `normatives` (3 rows), settings, templates, schema, RLS and Google Drive files were not changed.

## 2026-07-30 DOCX Template Handoff

- Active feature is `mvp-007` only. The source template supplied by the user at `D:\DONELVIT\TEMPLATES\Contract.docx` was copied byte-for-byte to `assets\docx-templates\Contract.docx`; its SHA-256 is `1C00BCE1C3A89A4FB96D38CDCA1ED92A8B6A7D6FEA94D144912EB6D8AC08E127`.
- Placeholders mapped in `app/api/contracts/[id]/generate/route.ts`: contract number/location/date/amount/amount words; client details, representative, banking requisites and contacts; and a user-selected object name/address. The picker only lists objects belonging to the contract client and the API validates the relationship again.
- Added `lib/contracts/contract-docx.ts` (Docxtemplater/PizZip), `lib/google-drive/service-account.ts` (server-only OAuth JWT and multipart upload), `components/contract-generation-form.tsx`, and the authenticated contract-generation route. The browser then stores the Drive URL in an existing `documents` record linked by `contract_id` through the existing guarded `create_document` RPC. No Supabase schema/RLS change is required.
- Dependencies installed with user approval: `docxtemplater@3.67.5`, `pizzip@3.2.0`. `npm run typecheck` passed. Local `npm run build` halted only at the known Windows sandbox `spawn EPERM`. Commit `2ec9111` was pushed to `main`; Vercel deployment `dpl_637LxCL7zqg5y6xCuPsqsKG7kCcM` is READY and its error-only build log reports only completion. `/contracts/1` in production visibly shows the object picker and `Сформировать DOCX` button.
- Drive folder supplied by user: `https://drive.google.com/drive/folders/1B4McqCVevbMxgJKAbY7UgtxxMmx4GAcF`; connector check succeeded and returned an empty folder. Do not place a key in source or `.env.local`. Next required user action is provide the service-account email/key and share that Drive folder with the email; set JSON in Vercel as `GOOGLE_SERVICE_ACCOUNT_JSON` and folder id as `GOOGLE_DRIVE_CONTRACTS_FOLDER_ID`. Afterwards push, wait for the Vercel build, then generate a real contract and verify the file, Drive link, and related Documents record.
- Visual QA of generated DOCX is still required. LibreOffice/`soffice` is unavailable in the local environment, so the template visual render could not be produced locally.

## 2026-08-07 Contract Client List Fix

- User reported that the contract form showed only one client despite having added clients, objects and projects. Production audit found three active rows in `donelvit.clients`, with an unrestricted SELECT RLS policy; the `create_contract` RPC remains authenticated-only.
- `app/contracts/new/page.tsx` and `app/contracts/[id]/edit/page.tsx` now export `dynamic = "force-dynamic"`, preventing Vercel from serving a build-time client list. `npm run typecheck` and `git diff --check` passed. Production deployment `dpl_DoSYDAZMYUFj4mAWmcYmrVoRGCfc` is READY; `/contracts/new` returned HTTP 200 with all three active client options. User should retry creating the contract while signed in.

## 2026-08-07 Engineering Verification Workspace

- Active feature: `engineering-agent-001`. User explicitly approved private Vercel Blob source files, Supabase persistence, `admin`/`engineer` editing, `viewer` read-only access and internal-draft wording.
- Applied migration `add_verification_workspace` directly to project `tyvjghubyljoocmeieeg`. It adds RLS-protected `verification_cases`, `verification_files`, `verification_findings` and `verification_calculations`. All four have authenticated SELECT policies; all mutation policies require `donelvit.get_my_role()` to be `admin` or `engineer`. Database audit confirmed RLS is enabled and no anon policy exists.
- Added `components/verification-workspace.tsx`, private client-upload token route `app/api/verification/upload/route.ts`, and dynamic `/verification`. The initial UI supports project-linked dossiers, private Blob upload registration (max 50 MB, PDF/DOCX/DOC/DWG/JPG/PNG), structured findings and a saved people-count calculation explicitly marked for manual engineering review. The package `@vercel/blob` is restored.
- Added `app/api/verification/files/[id]/route.ts` and a Download control in the dossier. The route verifies the Supabase token, reads the registered file through RLS, and streams it from private Blob with no shared cache; private Blob URLs are not exposed in the interface.
- Applied migration `add_verification_case_profile`: each dossier records one of five object profiles. New dossier creation automatically seeds its fire-safety and documentation checks as `incomplete` findings, preserving the requirement for the engineer to enter the actual official clause, evidence and decision.
- Added `docx@9.5.1`, `lib/verification/report-docx.ts`, and authenticated `app/api/verification/[id]/report/route.ts`. The dossier UI now offers a DOCX draft download. It is explicitly internal, includes metadata/files/findings/calculations, and is generated on demand rather than stored as an official conclusion. Typecheck/diff check passed; manual DOCX render awaits an authenticated real dossier after deployment.
- Added calculation templates in `components/verification-workspace.tsx`: preliminary backup-power capacity, acoustic comparison and fire-category basis. All persist to the existing RLS-protected calculations table and are automatically marked `manual_review_required`. `npm run typecheck` and `git diff --check` passed.
- Commit `f1b1f51` deployed as Vercel production `dpl_GnuyCZjvwcf5NhfL3X75HtoVhDXC` (READY). Error-only build logs contain only completion; `/verification` returned HTTP 200. A following local change adds editor-only internal status/verdict selection; typecheck and diff check passed, but it has not yet been committed/deployed. Never add the untracked legacy Access audit to a public commit.
- Production issue fixed on 2026-08-08: the UI correctly queried `user_roles`, but `authenticated` had no table SELECT privilege, so it fell back to viewer. Applied `grant_authenticated_role_read`: authenticated SELECT=true, anon SELECT=false, with the existing own-row/admin RLS policy retained. The current employee account is verified as an administrator. The project dropdown query was also corrected in commit `19689a9` from non-existent `projects.code` to `projects.project_number`; Vercel deployment `dpl_4hwBCaytNT2fydSGKErAU1hjmccW` is READY.
- User narrowed the product scope on 2026-08-08: only project verification for fire alarm, notification and fire-extinguishing systems. Do not reintroduce general construction/architecture, object-category or unrelated calculations. `lib/verification/catalog.ts` now defines only the systems profile; new dossiers use it.
- Added `app/api/verification/[id]/analyze/route.ts` and a `Запустить автопроверку DOCX` action. It verifies the current editor session, reads only private DOCX files not exceeding 10 MB through Blob, extracts document text with PizZip, and upserts five `AUTO-PS-*` preliminary findings. No file leaves the current Vercel/Supabase environment; this is deterministic key-term screening only and every result must be manually reviewed. PDF/DWG/scans remain out of scope until an approved parser/OCR path is added.
- User revised upload requirements: project files are PDF/DOCX up to 100 MB. Installed `pdfjs-dist@6.2.108`; the automatic analysis now handles text-based PDF and DOCX up to that size, with a 500-page PDF extraction guard. Upload rejects other formats. Image-only/scanned PDFs have no extractable text and remain manual/OCR work.
- `npm run typecheck` and `git diff --check` passed. Local report rendering with LibreOffice remains blocked by Windows temp-directory permissions; reference report structure was extracted with python-docx. Do not stage the untracked `docs/LEGACY-ACCESS-AUDIT-2026-08-07.md`; it contains non-public legacy Access metadata.
- Next step: add authorised file delivery, the vetted normative/check matrix and the internal DOCX draft generator, then deploy and manually prove both editor and viewer flows.

## 2026-07-30 Authentication and Roles Handoff

- The user explicitly deferred the outstanding Drive configuration and asked to continue. `mvp-007` is recorded complete with the listed operational deferrals; active feature is now `mvp-008` only.
- Before modifying authentication, roles, RLS, or authorization, inspect the existing Supabase Auth and current grants, then obtain explicit agreement on the role matrix. Existing invitation-only employee access must remain unchanged until that decision.
- Read-only audit result: one invited confirmed user has only provider metadata (no app role); all donelvit registries have anon/authenticated SELECT policies. Security Advisor still flags only `set_updated_at` mutable search_path and disabled leaked-password protection. No access setting was changed.
- User approved the role matrix: `admin` full access and role management; `engineer` mutable working data; `viewer` read-only. Applied Supabase migrations `add_application_roles`, `add_role_management_functions`, and `assign_default_role_to_new_users`. `user_roles` is RLS-enabled; direct grants are revoked, role functions are authenticated-only and guard by `auth.uid()`/role. Editor triggers cover Clients, Contracts, Documents, Objects, Projects and Expert Reviews. Existing invited account is `admin`; all new users default to `viewer`.
- UI: `components/role-management.tsx` is embedded in Settings and lets the admin change roles for invited users. `npm run typecheck` passed. Verify the production Settings page and a role mutation after deployment, then document deployment evidence and close `mvp-008` only if all acceptance criteria are met.
- `mvp-008` is complete. Production deployment `dpl_BPXH523BYh3BCV95BWMtWWihGTdJ` is READY and authenticated Settings showed Administrator plus the role-management table. Active feature is now `mvp-009` Final testing and launch. Start with a regression/evidence review; do not change product scope. Retain the explicit `mvp-007` Drive configuration and DOCX visual-QA deferrals in the final handoff.
- `mvp-009` is complete. See `docs/LAUNCH-HANDOFF.md` for production URL, release/rollback path, verified workflows, and deferred operational tasks. No feature remains active.
