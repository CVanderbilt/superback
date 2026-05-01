# Parser flow

This document describes how **parser runs** are tracked, how **scraped products** are stored, and how that relates to **normalization** (including the AI normalization step).

## Parser runs: the `Parser` model

The **`Parser`** table is **not** product data. It records **which parser jobs exist** and their **lifecycle**, so we can:

- See what is **active** (scraping in progress) vs **completed** or **canceled**
- Audit history per supermarket (`superId`)
- In the future, **drive and observe parsers from an admin dashboard** (start/stop, status, errors)

Each `Parser` row is tied to a **`Super`** via `superId` and uses `ParserStatus` (`ONGOING`, `COMPLETED`, `CANCELED`). Code that launches a scrape should create/update these rows accordingly.

## Products: the `NormalizedProduct` table

All product rows—**whether normalized or not**—live in **`NormalizedProduct`**.

### Non-normalized rows (`normalizationDate` is `null`)

These rows represent **ingestion only**. The **source of truth** for what came off the wire is mostly **`rawData`** (plus **`rawName`** and any other fields you choose to duplicate for convenience).

- **`normalizationDate` is `null`** means the row is **not** considered normalized yet, **even if** the parser was able to fill columns that *look* normalized (`name`, `searchName`, `description`, `url`, `categoryId`, `tags`, measurements, etc.). Those values are **provisional** until the **AI normalization process** validates them and then sets **`normalizationDate`**.

So: **normalized** in the product sense means **AI validation has run and committed**—signaled by a **non-null `normalizationDate`**, not by whether some columns were pre-filled during parsing.

### Normalized rows (`normalizationDate` is set)

After the AI normalization step validates and persists the canonical fields, **`normalizationDate`** is set. From then on, consumers can treat the normalized columns as **authoritative** (subject to any later corrections you define in product policy). The AI step may still **flag** fields (including **category**) as inaccurate or needing correction before or after that date, depending on how you implement review—but **ingestion still must always supply an initial category** (see below).

## Role of a supermarket parser (code under `src/workers/parsers/`)

The parser’s job is to **write product rows** into **`NormalizedProduct`** for the relevant `superId`, and to **update `Parser` status** for the run it belongs to.

For non-normalized rows, prefer **`rawData`** (and **`rawName`**) as the complete scrape payload; optional columns can hold best-effort extractions for convenience or downstream prompts, but they do **not** count as normalized until AI sets **`normalizationDate`**.

### Category is required on every insert

The schema requires **`categoryId`** on every **`NormalizedProduct`** row. **Parsers must always initialize** a category when inserting a product: resolve the supermarket’s category string to a **`Category`** (via **`CategoryAlias`** when applicable), or create **`Category`** / **`CategoryAlias`** rows as you implement each source. That initial assignment is still **provisional** until AI normalization validates it; the AI may later **flag** the category as wrong or suggest a different canonical category, but we **do not** allow rows without a parser-chosen category at ingest time.

A one-time migration may have backfilled legacy rows with null `categoryId` using a placeholder **`Uncategorized`** category. **New code must not rely on that**—every new product from a parser should use a meaningful category.

## What the parser should try to extract (into `rawData` and/or columns)

From each source item, capture whatever is reliably available, including:

- **`rawName`** and **`rawData`** (original label and JSON payload—especially important when `normalizationDate` is still `null`).
- **Required:** **`categoryId`** (parser-initialized canonical category; see above).
- **Name**, **description**, **URL**, **measurements**, **tags**—as available, all **provisional** until AI normalization sets **`normalizationDate`**.
- **Category** mapping: align supermarket labels with **`Category`** / **`CategoryAlias`** as described below.

**Tags**: canonical tag vocabulary and source-string mapping are not fully modeled yet. We will likely want a **tag alias** table (similar to **`CategoryAlias`**) to support robust tag normalization, but this is **not a current priority**. We will revisit it once search functionality and tag-based filters are implemented.

## Categories and aliases

- **`Category`**: canonical normalized category (shared across supermarkets).
- **`CategoryAlias`**: maps a **supermarket-specific category name** to a **`Category`**. The alias `name` is globally unique in the current schema, so identical labels from different chains must resolve to the same canonical category or we extend the model later.

Initially there are **no** `Category` rows and **no** `CategoryAlias` rows. As each parser is implemented:

1. **Introduce categories as needed** when you first encounter a label (create `Category`, then `CategoryAlias` pointing at it).
2. **Reuse** categories and aliases from earlier parsers whenever the meaning matches.
3. **Update or extend `CategoryAlias`** when you discover equivalent labels, instead of creating duplicate `Category` rows.

Avoid duplicate or overlapping categories up front. If duplicates still slip in, a **one-off data migration** can merge them—but that is costly, so **prefer fixing at ingestion time** (alias table + reuse).

## Related code and data

- Parser implementations: `src/workers/parsers/` (per supermarket).
- `Super` links **`Parser`** runs and **`NormalizedProduct`** rows.

For schema details (status enum, indexes, full-text search, normalization check constraint), see `prisma/schema.prisma` and `prisma/migrations/`.
