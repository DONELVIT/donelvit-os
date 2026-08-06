# Engineering Standards Library — Required Decisions

`mvp-010` will create a searchable engineering-library catalog for NCM, HG, EN, and ISO standards. The current `/normatives` page is only a static placeholder; no standards are stored in DONELVIT OS yet.

## Proposed safe scope

Start with a metadata registry:

- `/normatives` — search by code/title, filters, and pagination.
- `/normatives/[id]` — standard metadata, revision/status, source, and an authorised access link.
- Full standard files remain with their official provider unless written rights explicitly allow storage, distribution, text extraction, and indexing in DONELVIT OS.

## Confirmed candidate source: EDNC Moldova

The user supplied [EDNC](https://ednc.gov.md/), the MIDR Moldova portal for construction normative documents. It provides public catalog/search pages for NCM/CP, rich item metadata, source links and catalog PDFs. Use it for the initial metadata index and source links.

EDNC does not provide a verified documented API or CSV export. Its published rules distinguish unrestricted documents from material requiring registration or purchase. Therefore, do not mirror, OCR, or full-text index PDFs; retrieve metadata from public pages and send the user to the EDNC source link. EN/ISO must remain metadata and authorised-provider links until separate content rights are supplied.

## Required inputs before implementation

1. Meaning and jurisdiction of **NCM** and **HG**, and the initial document families, versions, and languages.
2. Official source URL or licensed provider for each family, plus the initial document list or import file.
3. Permissions: whether the app may store PDFs, show previews, allow downloads, extract/index text, or only link to the provider.
4. Required catalog fields. Recommended baseline: code, title, family, issuer, jurisdiction, revision/year, effective date, status, replaced/replacement reference, language, tags, source URL, and access/licence note.
5. Search expectation: exact/prefix code search, title search, and filters for family, status, year, jurisdiction, and language.
6. Who updates the catalog, how updates arrive (manual form, CSV, or provider API), and which application roles can manage entries.

## Design boundary

Linking Expert Reviews to a catalog record should preserve the existing free-text `normative_reference` as a historical snapshot. Adding that relationship, catalogue tables, or role-based catalog writes requires a separately approved Supabase schema/RLS change.

## Risks

EN and ISO materials are commonly licensed. Do not copy, publish, OCR, or full-text index them without permission. Version currency, source-link expiry, and jurisdiction must be clear to avoid using an obsolete or inapplicable standard.
