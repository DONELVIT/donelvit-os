# DONELVIT OS Architecture

## Purpose

DONELVIT OS is a Russian-language fire-engineering management interface. The current foundation focuses on projects and related operational sections, with a demo-data fallback when Supabase configuration is unavailable.

## Runtime Map

| Area | Location | Responsibility |
|---|---|---|
| App shell and global styles | `app/layout.tsx`, `app/globals.css` | Site metadata, Russian document language, shared layout and styles. |
| Pages/routes | `app/**/page.tsx` | Dashboard plus projects, clients, documents, normatives, objects, and settings flows. |
| Shared presentation | `components/` | App shell, project form, metrics, status badge. |
| Domain data and types | `lib/` | Demo data, project records, and shared types. |
| Supabase browser/server helpers | `lib/supabase/` | Clients configured for the `donelvit` schema. |

## Data Behaviour

- Browser access reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` and returns `null` if either is absent.
- The application is expected to continue with demo data until Supabase is configured.
- The intended schema is `donelvit`; it must be exposed in the Supabase project before browser Data API access can work.
- Local source cannot prove the live schema, grants, RLS policies, or production data. Treat those as external state requiring explicit verification.

## Change Boundaries

- Route behaviour: inspect the matching `app/**/page.tsx` plus its imported components/data helpers.
- UI changes: preserve existing layout and design conventions; avoid broad CSS rewrites for a single route feature.
- Data changes: inspect `lib/types.ts`, `lib/data/projects.ts`, `lib/demo-data.ts`, and relevant Supabase helper before editing consumers.
- Supabase changes: create an approved feature first; review current documentation, access model, RLS impact, and verification plan before writing SQL or migrations.

## Verification Baseline

```powershell
./init.ps1
```

This runs `npm run typecheck` and `npm run build`. No automated test suite exists yet, so route/data behaviour needs targeted manual verification until `quality-001` is completed.
