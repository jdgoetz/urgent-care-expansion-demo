CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS demo_ingestion_runs (
  run_id uuid PRIMARY KEY,
  source_name text NOT NULL,
  started_at timestamptz NOT NULL,
  completed_at timestamptz,
  status text NOT NULL CHECK (status IN ('running', 'succeeded', 'failed')),
  row_count integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS demo_regions (
  region_id text PRIMARY KEY,
  region_name text NOT NULL
);

CREATE TABLE IF NOT EXISTS demo_states (
  state_id text PRIMARY KEY,
  region_id text NOT NULL REFERENCES demo_regions(region_id),
  state_name text NOT NULL
);

CREATE TABLE IF NOT EXISTS demo_metros (
  metro_id text PRIMARY KEY,
  state_id text NOT NULL REFERENCES demo_states(state_id),
  metro_name text NOT NULL
);

CREATE TABLE IF NOT EXISTS demo_pockets (
  pocket_id text PRIMARY KEY,
  pocket_name text NOT NULL,
  region_id text NOT NULL REFERENCES demo_regions(region_id),
  state_id text NOT NULL REFERENCES demo_states(state_id),
  metro_id text NOT NULL REFERENCES demo_metros(metro_id),
  centroid_lat double precision NOT NULL,
  centroid_lon double precision NOT NULL,
  geometry geometry(Polygon, 4326) NOT NULL,
  metrics jsonb NOT NULL,
  competitors jsonb NOT NULL,
  opportunities jsonb NOT NULL,
  scores jsonb NOT NULL,
  source_status text NOT NULL,
  methodology_note text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS demo_pockets_geometry_gix ON demo_pockets USING gist (geometry);
CREATE INDEX IF NOT EXISTS demo_pockets_state_idx ON demo_pockets (state_id);
CREATE INDEX IF NOT EXISTS demo_pockets_metro_idx ON demo_pockets (metro_id);

