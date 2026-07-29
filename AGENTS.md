# DONELVIT OS — Agent Operating Manual

DONELVIT OS is a Next.js 15 / React 19 TypeScript application for fire-engineering project management. It uses Supabase through the `donelvit` schema and can fall back to demo data when public Supabase configuration is absent.

## Startup Workflow

Before writing code:

1. Confirm the repository root, then read this file.
2. Read `docs/ARCHITECTURE.md`, `feature_list.json`, and `progress.md`.
3. Read `session-handoff.md` when resuming a session.
4. Run `./init.ps1` on Windows or `./init.sh` in a POSIX shell.
5. If baseline verification fails, record the failure and repair it before adding scope.

Use progressive disclosure: read the route/component/data files relevant to the active feature, rather than loading the whole project. `.agent-harness/memory/INDEX.md` is a bounded index; open an individual topic only when it applies.

## Working Rules

- **One feature at a time.** Select exactly one non-complete item in `feature_list.json`; do not start another one until its outcome is recorded.
- **Stay in scope.** Do not refactor unrelated routes, replace dependencies, or alter product behaviour without a feature entry and explicit need.
- **Preserve state.** Update `feature_list.json`, `progress.md`, and `session-handoff.md` before ending a work session.
- **Use evidence.** A feature is not complete because code was written; record commands run, their result, and any manual check.
- **Keep restartability.** Do not leave generated output, running dev servers, or unrecorded decisions as prerequisites for the next session.

## Project Boundaries

- UI routes live in `app/`; reusable UI belongs in `components/`; data/types/Supabase access belongs in `lib/`.
- Keep TypeScript strict and preserve the `@/` import alias.
- Treat `.env.local` as secret. Never print, commit, or move its contents. Only `NEXT_PUBLIC_SUPABASE_URL` and the publishable/anon key may be exposed to the browser; never introduce a `service_role` key into client code.
- Supabase schema, RLS, storage, auth, or migration changes require an explicit feature, current documentation review, and recorded verification. Never run destructive SQL, change RLS, or apply a migration without user approval.
- Do not edit `node_modules/`, `.next/`, or generated lockfile contents by hand. Use `npm ci` only when dependencies are absent or intentionally refreshed.

## Definition of Done

A feature is done only when all applicable items are true:

- [ ] Its acceptance criteria in `feature_list.json` are satisfied.
- [ ] `npm run typecheck` and `npm run build` pass.
- [ ] Relevant manual route/API verification is performed; automated tests are added when the feature has testable logic.
- [ ] Verification evidence and any residual risk are recorded in the state files.
- [ ] Documentation is updated when the architecture, setup, or user workflow changed.

The project has no automated test runner yet. Do not claim tests passed unless a runner and tests have actually been added; use the documented build/typecheck plus targeted manual verification as the current baseline.

## End of Session

1. Re-run the required verification for the active feature.
2. Update feature status and evidence in `feature_list.json`.
3. Update `progress.md` and `session-handoff.md` with files changed, decisions, blockers, and the single next step.
4. Leave a clean, reproducible state. Commit only when the user requests it or the repository is configured for that workflow.

## Verification Commands

```powershell
# Windows
./init.ps1

# POSIX shell
./init.sh

# Focused checks
npm run typecheck
npm run build
```

## Escalate Instead of Guessing

Ask the user before changing product requirements, data ownership/RLS, database schema, authentication, external services, package versions, or any destructive operation. After two failed attempts at the same approach, stop, record the evidence, and choose a materially different diagnostic path.
