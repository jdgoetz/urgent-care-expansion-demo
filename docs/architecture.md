# Architecture

## Runtime flow

Synthetic source specifications are validated with Zod and deterministically transformed into metrics, competitors, opportunities, and three demo scores. The idempotent ingestion job upserts one region, two states, five metros, and 18 pockets into PostgreSQL/PostGIS.

Next.js route handlers read through a typed repository. In database mode the repository queries PostGIS and serializes geometry as GeoJSON. In preview mode it serves the same deterministic in-memory objects.

The React interface renders pockets directly, keeping metro as a filter and reporting dimension rather than a required navigation step.

## Boundaries

- data/synthetic defines fictional inputs only.
- ingestion/demo validates and persists deterministic records.
- lib/scoring contains the public illustrative models.
- lib/server isolates database access.
- app/api is the typed HTTP boundary.
- components contains presentation and interaction.
- reporting demonstrates deterministic executive output from synthetic data.

## Production separation

This design mirrors common platform boundaries without copying production source, database exports, provider responses, exact model weights, opportunity search queries, or Git history.

