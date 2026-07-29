# DONELVIT OS — MVP Roadmap

## Confirmed scope

- MVP concept, module structure, and feature boundary are agreed.
- Existing Supabase tables and functions remain the foundation; this roadmap does **not** authorize a schema redesign.
- GitHub repository access is not yet available. Local development can continue, but GitHub collaboration, pull requests, and repository-based publishing require access.

## Implementation order

| Order | Feature | Dependency | Status |
|---:|---|---|---|
| 1 | Projects | MVP constraints | Planned |
| 2 | Clients | Projects | Planned |
| 3 | Objects | Clients | Planned |
| 4 | Documents | Objects | Planned |
| 5 | Contracts | Documents | Planned |
| 6 | Expert Review | Contracts | Planned |
| 7 | DOCX templates | Expert Review | Planned |
| 8 | Authentication and roles | DOCX templates | Planned |
| 9 | Final testing and launch | Authentication and roles | Planned |

The authoritative acceptance criteria and evidence for every phase are in `feature_list.json`.

## Delivery discipline

1. Activate only the next incomplete item in `feature_list.json`.
2. Confirm the MVP behaviour and existing Supabase capability before changing code.
3. Do not create tables, migrations, RLS policies, storage rules, or authentication changes without explicit approval.
4. Run baseline verification and targeted manual checks; capture evidence before closing the phase.
5. Before launch, obtain GitHub/deployment access and confirm rollout and rollback ownership.
