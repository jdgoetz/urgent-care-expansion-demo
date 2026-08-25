ALTER TABLE demo_pockets
  ALTER COLUMN geometry TYPE geometry(Geometry, 4326) USING geometry::geometry;

ALTER TABLE demo_pockets
  ADD COLUMN IF NOT EXISTS zip_code text NOT NULL DEFAULT '00000',
  ADD COLUMN IF NOT EXISTS market_type text NOT NULL DEFAULT 'comparison',
  ADD COLUMN IF NOT EXISTS data_completeness numeric NOT NULL DEFAULT 100;

