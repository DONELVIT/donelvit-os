# Session Handoff

## Current Objective

- Goal: deliver DONELVIT OS MVP in the approved module order.
- Current status: `mvp-001` — Projects is active; public reads work and project mutations are limited to invited, authenticated employees.
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
- An invited employee account has signed in successfully. The three authenticated project mutations still need end-to-end verification from an authenticated UI session. Do not create another account or send a duplicate invitation unless the user requests it.
- Supabase Security Advisor still reports a mutable search path in the unrelated `donelvit.set_updated_at` trigger function; its remediation needs separate review.
- Supabase CLI is not installed and no local migration folder exists, so the approved production function changes have no tracked local migration yet.

## Next Session Startup

1. Read `AGENTS.md`, `feature_list.json`, `progress.md`, and `docs/MVP-ROADMAP.md`.
2. Continue exactly one active feature: `mvp-001` — Projects.
3. Run `./init.ps1` on Windows or `./init.sh` in a POSIX shell before editing.

## Recommended Next Step

- In the signed-in production session, perform the authenticated create/edit/archive acceptance check.
