# Session Handoff

## Current Objective

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

## 2026-07-30 DOCX Template Handoff

- Active feature is `mvp-007` only. The source template supplied by the user at `D:\DONELVIT\TEMPLATES\Contract.docx` was copied byte-for-byte to `assets\docx-templates\Contract.docx`; its SHA-256 is `1C00BCE1C3A89A4FB96D38CDCA1ED92A8B6A7D6FEA94D144912EB6D8AC08E127`.
- Placeholders mapped in `app/api/contracts/[id]/generate/route.ts`: contract number/location/date/amount/amount words; client details, representative, banking requisites and contacts; and a user-selected object name/address. The picker only lists objects belonging to the contract client and the API validates the relationship again.
- Added `lib/contracts/contract-docx.ts` (Docxtemplater/PizZip), `lib/google-drive/service-account.ts` (server-only OAuth JWT and multipart upload), `components/contract-generation-form.tsx`, and the authenticated contract-generation route. The browser then stores the Drive URL in an existing `documents` record linked by `contract_id` through the existing guarded `create_document` RPC. No Supabase schema/RLS change is required.
- Dependencies installed with user approval: `docxtemplater@3.67.5`, `pizzip@3.2.0`. `npm run typecheck` passed. Local `npm run build` halted only at the known Windows sandbox `spawn EPERM`. Commit `2ec9111` was pushed to `main`; Vercel deployment `dpl_637LxCL7zqg5y6xCuPsqsKG7kCcM` is READY and its error-only build log reports only completion. `/contracts/1` in production visibly shows the object picker and `Сформировать DOCX` button.
- Drive folder supplied by user: `https://drive.google.com/drive/folders/1B4McqCVevbMxgJKAbY7UgtxxMmx4GAcF`; connector check succeeded and returned an empty folder. Do not place a key in source or `.env.local`. Next required user action is provide the service-account email/key and share that Drive folder with the email; set JSON in Vercel as `GOOGLE_SERVICE_ACCOUNT_JSON` and folder id as `GOOGLE_DRIVE_CONTRACTS_FOLDER_ID`. Afterwards push, wait for the Vercel build, then generate a real contract and verify the file, Drive link, and related Documents record.
- Visual QA of generated DOCX is still required. LibreOffice/`soffice` is unavailable in the local environment, so the template visual render could not be produced locally.

## 2026-07-30 Authentication and Roles Handoff

- The user explicitly deferred the outstanding Drive configuration and asked to continue. `mvp-007` is recorded complete with the listed operational deferrals; active feature is now `mvp-008` only.
- Before modifying authentication, roles, RLS, or authorization, inspect the existing Supabase Auth and current grants, then obtain explicit agreement on the role matrix. Existing invitation-only employee access must remain unchanged until that decision.
- Read-only audit result: one invited confirmed user has only provider metadata (no app role); all donelvit registries have anon/authenticated SELECT policies. Security Advisor still flags only `set_updated_at` mutable search_path and disabled leaked-password protection. No access setting was changed.
- User approved the role matrix: `admin` full access and role management; `engineer` mutable working data; `viewer` read-only. Applied Supabase migrations `add_application_roles`, `add_role_management_functions`, and `assign_default_role_to_new_users`. `user_roles` is RLS-enabled; direct grants are revoked, role functions are authenticated-only and guard by `auth.uid()`/role. Editor triggers cover Clients, Contracts, Documents, Objects, Projects and Expert Reviews. Existing invited account is `admin`; all new users default to `viewer`.
- UI: `components/role-management.tsx` is embedded in Settings and lets the admin change roles for invited users. `npm run typecheck` passed. Verify the production Settings page and a role mutation after deployment, then document deployment evidence and close `mvp-008` only if all acceptance criteria are met.
- `mvp-008` is complete. Production deployment `dpl_BPXH523BYh3BCV95BWMtWWihGTdJ` is READY and authenticated Settings showed Administrator plus the role-management table. Active feature is now `mvp-009` Final testing and launch. Start with a regression/evidence review; do not change product scope. Retain the explicit `mvp-007` Drive configuration and DOCX visual-QA deferrals in the final handoff.
- `mvp-009` is complete. See `docs/LAUNCH-HANDOFF.md` for production URL, release/rollback path, verified workflows, and deferred operational tasks. No feature remains active.
