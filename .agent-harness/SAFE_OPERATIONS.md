# Agent Safety Policy

## Safe without additional approval

- Read repository files, inspect configuration, run `npm run typecheck`, `npm run build`, and local non-destructive diagnostics.
- Create narrowly scoped source, documentation, and harness files for the active feature.

## Ask before acting

- Any database migration, SQL write, RLS/policy change, storage rule, auth configuration, or use of Supabase production credentials.
- Deleting, overwriting, moving, or bulk-reformatting user files; regenerating lockfiles; changing package versions; publishing/deploying; contacting external systems.
- Editing `.env.local` or introducing a server secret. Never write a Supabase `service_role` key into code or a `NEXT_PUBLIC_` variable.

## Execution discipline

- Classify each command call: read-only inspections can run together; all writes, installs, builds that emit files, migrations, and dev servers run serially.
- Do not run `rm -rf`, `git reset --hard`, database `DROP`/unbounded `DELETE`, or equivalent destructive actions.
- After two repeated failures, stop retrying, record the error and attempted commands in `progress.md`, and take a different diagnostic approach.
