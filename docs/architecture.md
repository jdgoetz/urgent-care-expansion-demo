# Architecture

## Runtime flow

Curated market specifications combine public observations with official Census TIGERweb ZCTA geometry and explicit five-mile display radii. Zod validates the records before the idempotent ingestion job upserts one region, two states, seven metro contexts, and nine markets into PostgreSQL/PostGIS.

Next.js route handlers read through a typed repository. In database mode the repository queries PostGIS and serializes geometry as GeoJSON. In preview mode it serves the same deterministic in-memory objects. The map uses canonical centroids and persisted display radii for its dominant circular market layer; the ZCTA remains the analytical and lineage geometry.

The React interface renders pockets directly, keeping metro as a filter and reporting dimension rather than a required navigation step.

## Boundaries

- `data/public` contains curated public observations, source references, official ZCTA geometry, centroids, and display radii.
- `ingestion/demo` validates and persists deterministic public-demo records.
- lib/scoring contains the public illustrative models.
- lib/server isolates database access.
- app/api is the typed HTTP boundary.
- components contains presentation and interaction.
- `reporting` demonstrates deterministic executive output from the curated public dataset.

## Production separation

This design mirrors common platform boundaries without copying private source, Git history, database exports, provider responses, exact production weights, opportunity-search queries, or private targets.
